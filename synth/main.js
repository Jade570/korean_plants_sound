document.querySelector('button')?.addEventListener('click', async () => {
	await Tone.start()
	console.log('audio is ready')
})

let mode = [
    [0,2,4,6,8,10],
    [0,1,3,4,6,7,9,10],
    [0,2,3,4,6,7,8,10,11],
    [0,1,2,5,6,7,8,11],
    [0,1,5,6,7,11],
    [0,2,4,5,6,8,10,11],
    [0,1,2,3,5,6,7,8,10,11]
]