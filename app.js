

const express = require("express");
const mongoose= require("mongoose");
const _ =require("lodash");



const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-Sk:test@123@cluster0.bflyy.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser:true ,useUnifiedTopology: true });
const itemsSchema= (
  {name:String
  });
const Item=mongoose.model("Item" , itemsSchema);



const item1 = new Item({
  name : "Welcome to the to-do list!"


});
const item2=new Item({
  name : "You can add items here to the to-do list!"


});
const item3=new Item({
  name : "You also can delete here from the to-do list!"


});
const defaultItems=[item1,item2,item3];
const listSchema=
  {name:String,
    items:[itemsSchema]
  };
const List= mongoose.model("List" ,listSchema)


app.get("/", function(req, res) {


  Item.find({} ,  function(err , foundItems){
    if(foundItems .length === 0){
      Item.insertMany(defaultItems , function(err){
        if(err){
          console.log(err);
      
        }else{
          console.log("Successfully inserted the items");
        }
      });
      res.redirect("/")
    }else{
    res.render("list", {listTitle: "Today" , newListItems: foundItems});
  }
  });
});
app.get("/:customListName", function(req,res){
const customListName =_.capitalize(req.params.customListName);
List.findOne({name :customListName} ,function(err ,foundList ){
  if(!err){
  if (!foundList){
    //Create a new list
    const list=new List({
      name:customListName,
      items:defaultItems
    });
    list.save();
    res.redirect("/" + customListName);
  }else{
    res.render("list", {listTitle: foundList.name , newListItems: foundList.items });
  }
  }


});


});
  
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
const item=new Item({
  name:itemName
});
if(listName==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err ,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" +listName);
  });
}
});
  app.post("/delete" , function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(err){
    console.log(err);
  }else{
    console.log("removed !");
  }
  res.redirect("/");
});
}else{
  List.findOneAndUpdate({name:listName},{$pull :{items:{ _id:checkedItemId}}} ,function(err ,foundList){
    if(!err){
      res.redirect("/" +listName);
    }
  });
}
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: itemsSchema});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port , function() {
  console.log("Server  has started on successfully");
});
