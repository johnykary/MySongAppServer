const app = require('express')();
const http = require('http').Server(app);
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');



const port = 7777;
const pathSongs = __dirname + '/songs/';


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`)
})

          

app.get('/', (req,res) =>{
    var data = {
        artists:[]
    };

    var artistsArray = [];
    fs.readdirSync(pathSongs).forEach(file => {
          artistsArray.push(file);
     })
    
    // for(i=0; i<artistsArray.length; i++){
    //      fs.readdirSync(pathSongs + artistsArray[i]).forEach(file => {
    //       data.artists.push({artistname :  artistsArray[i],
    //                         songname: file.replace('.mp3',''),
    //                         songpath : artistsArray[i] + "/" + file
    //                         })
    //     })
    // }
    for(i=0; i<artistsArray.length; i++){
        fs.readdirSync(pathSongs + artistsArray[i]).forEach(album =>{
            fs.readdirSync(pathSongs + artistsArray[i] +'/' + album).forEach(song =>{
                if(song.endsWith('.mp3')){
                    data.artists.push({
                        artistname :artistsArray[i],
                        albumname: album,
                        songname: song.replace('.mp3',''),
                        songpath : artistsArray[i] + "/" + album + '/' + song   
                })}
            })
        })
    }
    

    res.end(JSON.stringify(data));   

})



app.post('/search', (req, res) =>{
    var data = {
        artists:[]
    };
    var artistQuery = (req.body.artist);

    var sql = 'SELECT artistname, songname, song FROM SONGS WHERE artistname = ?';
    connection.query(sql, [artistQuery] ,(err, rows, fields) =>{
        if (!err){ 
            if(rows.length != 0 ){
                for(var i =0; i<rows.length; i++){
                    var song = rows[i].songpath;

                    data.artists.push({artistname : rows[i].artistname,
                                songname: rows[i].songname,
                                songpath: replacedString});
                }
                res.end(JSON.stringify(data));       
            }
        }else{
            data['artist'] = 'No data Found';
            res.json(data);
        }
    })
})


app.get('/play/:artistname/:albumname/:songname', (req, res) =>{
    var filePath = path.join(pathSongs, req.params.artistname, req.params.albumname, req.params.songname);
    var stat = fs.statSync(filePath);   

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });
    console.log(`Now playing: ${req.params.artistname} :` +  req.params.songname.replace('.mp3',''));
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    
})


