import React, { useEffect, useRef, useState } from "react"
import "./App.css"

function App() {
	const [ stream, setStream ] = useState()
	const myVideo = useRef()

	useEffect(() => {
    console.log(navigator)
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
				myVideo.current.srcObject = stream
		})
	},[])
console.log(stream)
console.log(myVideo)


	return (
		<>
			<h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
		<div className="container">
			<div className="video-container">
				<div className="video">
					{stream &&  <video playsInline ref={myVideo} autoPlay style={{ width: "300px" }} />}
				</div>
			</div>
		</div>
		</>
	)
}

export default App
