//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});

const itemsSchema = new mongoose.Schema({
  name : String
});

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({

  name : "Welcome to your todolist!"

});
  
const item2 = new Item({

  name : "Hit the + button to add a new item"

});

const item3 = new Item({
  name : "<-- Hit this to delete the item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({} , function(err, founditems){

  if(founditems.length===0){

    Item.insertMany(defaultItems , function(err){
      if(err){
        console.log("err");
      }
      else{
        console.log("Successfully added items to DB.");
      }
    });
    res.redirect("/");
  }else{

      res.render("list", {listTitle: "Today" , newListItems: founditems});
    }
  });
  });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const item = new Item({
    name : itemName
  });
item.save();
res.redirect("/"); 
});

app.post("/delete",function(req,res){
  const checkedId = req.body.checkbox;
  Item.findByIdAndRemove(checkedId , function(err){

    if(err){
      console.log("success");
    }
    else{
      console.log("successfully removed!");
      res.redirect("/");
    }

  });
});

app.get("/:postName" , function(req,res){

  const postName = req.params.postName;

  List.findOne({name:postName} , function(err , foundlist){
    if(!err){
      if(!foundlist){
        //create a new list
        const list = new List({
          name: postName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + postName);
      }
      else{
        //show an existing list
        res.render("list" , {listTitle: foundlist.name , newListItems: foundlist.items});
      }
    }
  });

  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


