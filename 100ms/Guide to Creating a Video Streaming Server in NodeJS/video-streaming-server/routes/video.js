const express = require('express')
const router = express.Router()
const videos = require('../metadata')
// get the metadata of all videos
router.get('/', (req,res)=>{
    res.json(videos)
})

router.get('/:id/metadata', (req,res)=> {
    const id = parseInt(req.params.id, 10)
    res.json(videos[id])
})
module.exports = router;
