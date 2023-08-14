const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const mongoose = require("mongoose");

const app = express();

//let items=["Buy food", "cook food ", "eat food"];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Dheeraj_25:Dheeraj_25@cluster0.hkgfcza.mongodb.net/todolistDB" , {useNewUrlParser: true});

const itemsSchema={
  name: String
};

const item = mongoose.model('item' , itemsSchema);
const item1 = new item({
  name: 'Welcome to Your todolist!'
});
const item2 = new item({
  name: 'Hit the + button to add new item'
});
const item3 = new item({
  name: '<-- Hit this to delete'
});

const defaultItems=[item1 , item2 , item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get ("/", function(req , res){

    item.find({}, function(err, foundItems){

      if(foundItems.length===0){

        item.insertMany(defaultItems , function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("successfully inserted into database");
          }
        })

        res.redirect("/");
      }else{
          res.render("list" , {listTitle: "Today" , newitems:foundItems});
      }


  });



});

app.post("/",function(req,res){

  const itemName = req.body.item;
  const listName = req.body.list;

  const newItem = new item({
    name:itemName
  });


  if (listName === "Today"){
    newItem.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName}, function(err,foundList1){
      foundList1.items.push(newItem);
      foundList1.save();
      res.redirect("/" + listName);
    });
  }
});



app.post("/delete" , function(req,res){

const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log('unable to delete successfully');
    }else{
      res.redirect("/")
    }
  });
} else{
  List.findOneAndUpdate({name:listName}, {$pull:{items: {_id : checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}


});


app.get("/:customlistName", function(req,res){
  const customlistName =  _.capitalize(req.params.customlistName);

  List.findOne({name:customlistName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create new list
        const list = new List({
          name:customlistName,
          items : defaultItems
        });

        list.save();

        res.redirect("/"+customlistName);
      }else{
        //show new list
        res.render("list" , {listTitle: foundList.name , newitems:foundList.items});
      }
    }
  });



  });





app.listen(process.env.PORT || 3000, function(){
  console.log("server has started on port 3000 successfully...")
})
