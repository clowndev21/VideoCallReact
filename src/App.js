import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
// import io from "socket.io-client"
import "./App.css"


var client = new WebSocket('wss://videocallserverdj.herokuapp.com/ws/');
function App() {
	const [ me, setMe ] = useState("abcd")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")
	const [ sender, setSender]=useState(false)

	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()


	useEffect(() => {
		console.log('first')
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
				myVideo.current.srcObject = stream
		})
	}, [])

	
	client.onopen=()=>{
		console.log('connected')
	}
	client.onmessage = (dat) => {
		console.log(sender)
		const data=JSON.parse(dat.data)
		
		if(!sender&&data.taskName==="call"){
			console.log('datacall')
			console.log(data)
		setReceivingCall(true)
		setCaller(data.from)
		setName(data.name)
		setCallerSignal(data.signalData)
		}else{
			setReceivingCall(false)
		setCaller('')
		setName("")
		setCallerSignal(null)
		}
	};


	const callUser = (id) => {
		
		console.log('call rqst1')
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		console.log(peer)
		peer.on("signal", (data) => {
			console.log('cl rq signal')
			console.log(data)
			client.send(JSON.stringify( {
				taskName:"call",
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			}))
		})
		peer.on("stream", (stream) => {
			console.log('cl rq streem')
				userVideo.current.srcObject = stream
			
		})
		client.onmessage = (dat) => {
			const data=JSON.parse(dat.data)
			console.log('data')
			console.log(data)
			if(data.taskName="accept"){
				// setCallAccepted(true)
				peer.signal(data.signal)
			}
			
		}
		// socket.on("callAccepted", (signal) => {
		// 	console.log('rq acpted')
		// 	setCallAccepted(true)
		// 	peer.signal(signal)
		// })

		connectionRef.current = peer
	}

	const answerCall =() =>  {
		setCallAccepted(true)
		console.log("call ans")
		console.log(stream)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		console.log(peer)
		peer.on("signal", (data) => {
			console.log('rcv signal')
			client.send(JSON.stringify({ signal: data, taskName: "accept" }))
			// socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			console.log('rcv streem')
			userVideo.current.srcObject = stream
		})
		console.log('callerSignal')
		console.log(callerSignal)
		peer.signal(callerSignal)
		console.log('ans send signal')
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
	}


	useEffect(()=>{
		if(idToCall){
			setSender(true)
		}else{
			setSender(false)
		}
	},[idToCall])
	return (
		<>
			<h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
		<div className="container">
			<div className="video-container">
				<div className="video">
					{stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
				</div>
				<div className="video">
					{!callEnded ?
					<video playsInline ref={userVideo} muted autoPlay style={{ width: "300px"}} />:
					null}
				</div>
			</div>
			<div className="myId">
				<TextField
					id="filled-basic"
					label="Name"
					variant="filled"
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{ marginBottom: "20px" }}
				/>
				<CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
					<Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
						Copy ID
					</Button>
				</CopyToClipboard>

				<TextField
					id="filled-basic"
					label="ID to call"
					variant="filled"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value) }
				/>
				<div className="call-button">
					{callAccepted && !callEnded ? (
						<Button variant="contained" color="secondary" onClick={()=>{}}>
							End Call
						</Button>
					) : (
						<IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
							<PhoneIcon fontSize="large" />
						</IconButton>
					)}
					{idToCall}
				</div>
			</div>
			<div>
				{receivingCall && !callAccepted ? (
						<div className="caller">
						<h1 >{name} is calling...</h1>
						<Button variant="contained" color="primary" onClick={answerCall}>
							Answer
						</Button>
					</div>
				) : null}
			</div>
		</div>
		</>
	)
}

export default App
