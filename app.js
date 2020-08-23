const express = require("express");
const bodyParser = require ("body-parser");
const mongoose =  require("mongoose");
const _ = require("lodash");
mongoose.connect("mongodb://localhost:27017/itemDB", {useNewUrlParser:true, useUnifiedTopology: true});


const app = express();

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item ({
    name: "Hi on your to do list"
});

const item2 = new Item ({
    name: "You can use it everyday!"
});

const item3 = new Item ({
    name: "<--- delete the work by clicking it!"
});

const defaultItems = [item1, item2, item3];
const ListSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", ListSchema);


app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.use(express.static("public"));


app.get("/", function(req, res){

Item.find({}, function(err, founditems){
if (founditems.length === 0){
    Item.insertMany(defaultItems, function(err){
        if(err){
            console.log(err);
        }else{
            console.log("items successfully added!");
        }

        
    });
    res.redirect("/")
}else{
    res.render("list", {listTitle: "Today", newListItem: founditems});
}
});  

});

app.post("/", function(req, res){
const itemName = req.body.newName;
const listName = req.body.list;
const item = new Item ({
    name : itemName
});

if(listName === "Today"){
    item.save();

    res.redirect("/");
}else {
List.findOne({name: listName}, function(err, foundList){
if (err){
    console.log(err);
}else{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
}
});
}
});

app.post("/delete", function(req, res){
const checkName = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
    Item.findByIdAndRemove(checkName, function(err){
        if(err){
            console.log(err);
        }else {
            console.log("successfully deleted the item");
            res.redirect("/");
        }
        });
}else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkName}}}, function(err, foundList) {
        if(!err){
            res.redirect("/"+ listName);
        }
   });
}

});

app.get("/:todoName", function(req, res){
const todoTitle = _.capitalize(req.params.todoName);


List.findOne({name: todoTitle}, function(err, foundList){
    if(!err){
        if(!foundList){
            const list = new List ({
                name : todoTitle,
                items: defaultItems
            });
            list.save();
            res.redirect("/"+ todoTitle);
        }else{
            res.render("list", {listTitle: foundList.name , newListItem: foundList.items} );
        }
    }
});
});



app.listen(3000, function(req, res ){
    console.log("Server is running on port 3000. . .");
}); 