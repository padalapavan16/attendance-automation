var express = require('express');
var router = express.Router();
var monk=require('monk');
var db=monk('localhost:27017/attendance-automation');
var collection=db.get('attendance');

/* GET home page. */
router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/', function(req, res) {
	res.render('home');
  });

router.get('/main', function(req, res) {
  res.render('main');
});

router.post('/post',(req,res)=>{
  collection.insert({'teacher':req.body.teacher,'period':req.body.period,'date':req.body.date,'attendance':req.body.attendance},(err,docs)=>{
		if(err){
			console.log(err);
		}
		else{
      console.log(docs);
      res.redirect('/')
		}
	})
})

module.exports = router;
