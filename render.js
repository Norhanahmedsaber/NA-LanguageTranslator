let counter=0
setInterval(async ()=>{
    const req = await fetch('https://hanter-backend.onrender.com/rules')
    console.log(await req.json())
    counter++
    console.log(counter)
},300000)