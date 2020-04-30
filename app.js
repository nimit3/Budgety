//---------------BUDGETCONTROLLER------------------
var budgetController = (function() {
    //DS for expense(object)
    var Expense = function(id, description, value){
        this. id=id;
        this. description=description;
        this.value=value;
        this.percentage=-1;
    };
    
    Expense.prototype.calcPercentage= function(totlIncome){
        if(totlIncome > 0){
        this.percentage=Math.round((this.value/totlIncome)*100);
        } else{
            this.percentage=-1;
        }
    };
    
    Expense.prototype.getPercentage =function(){
        return this.percentage;
    }
    
    //DS for Income
        var Income = function(id, description, value){
        this. id=id;
        this. description=description;
        this.value=value;
    };
    //here will will store all our expense and income objects in this "array" DS
    var data={
        allItems:{
            exp: [],
            inc: [],
        },
        total:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    };
    
    //private function for calculating total
    var calculateTotal = function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
           sum=sum + cur.value; 
        });
        //for storng the sum value in total
        data.total[type]=sum;
    }
    
    //for getting the value in our exp.nc abjects and then storing inside data(DS) 
    return{
        addItem: function(type, desc, val){
            
            var ID, newItem;
            
            //create a new ID
            // [1,2,3,4,5] next id=6
            //[3,4,5,6,7,8] next id=9
            //ID= last ID +1
            if(data.allItems[type].length > 0){
            ID= data.allItems[type][data.allItems[type].length - 1].id +1;
            }
            else{
                ID=0;
            }
            //create anew item based on the type
            if(type==='exp'){
                newItem = new Expense(ID, desc, val);
            }
            else if(type==='inc'){
                newItem= new Expense(ID, desc, val);
            }
            
            //push it into our DS
            data.allItems[type].push(newItem);
            
            //return the new element
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            
            ids= data.allItems[type].map(function(current){
                return current.id;
            })
            
            index= ids.indexOf(id);
            
            if(index !== -1){
                
            data.allItems[type].splice(index,1); 
            }
            
        },
        
        calculateBudget: function(){
         
        //calculate totla income and expenses
        calculateTotal('exp');
        calculateTotal('inc');
        
        //calclate the budget: income - expense
        data.budget = data.total.inc - data.total.exp;
        
        //calculate the % of income that we spent
            
        if(data.total.inc > 0) {   
        data.percentage =Math.round((data.total.exp*100)/ data.total.inc);
           }
        else{
            data.percentage = -1;
        }    
        },
        
        calculatePercentages: function(){    
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.total.inc);
            });
            
        },
        
        getPrcentages: function(){
            var allPer=data.allItems.exp.map(function(current){
               return current.getPercentage();
                
            });
            return allPer;
        },
        
        getBudget: function(){
          return{
              budget: data.budget,
              totalInc: data.total.inc,
              totalExp: data.total.exp,
              percentage: data.percentage
          };  
        },
        
        testing: function(){
            return data;
        }
    };
 
    
                                            
})();



//---------------------------------------------UICONTROLLER------------------------------------------
var UIController= (function(){
    
    var Domstrings={
        inputType: '.add__type',
        descriptionType: '.add__description',
        valueType: '.add__value',
        inputBtn: '.add__btn',
        icomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
            var formatNumber = function(num, type){
            var numSplit, int, dec, type;
            /*
            + or - before number
            exactly 2 decimal
            comma seprating the thousands
            
            */
            
            num=Math.abs(num);
            num=num.toFixed(2);
            
            numSplit=num.split('.');
            int=numSplit[0];
            
            if(int.length > 3){
                int = int.substr(0, int.length-3) + ',' + int.substr(int.length -3, 3);
            }
            
            dec=numSplit[1];
            
            type === 'exp' ? sign = '-' : sign='+';
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +dec;
        };
    
    return {
        getinput : function(){
            return{
            type : document.querySelector(Domstrings.inputType).value, //will be eithe inc or exp
             description: document.querySelector(Domstrings.descriptionType).value,  //we are returning the all 3 values as one object
             value: parseFloat(document.querySelector(Domstrings.valueType).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newhtml, element;
            //create HTML strings with palceholder text
            if(type=== 'inc'){
            element=Domstrings.icomeContainer;    
            html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-outline"></ion-icon></button></div></div></div>';
            }
            else if(type==='exp'){
            element=Domstrings.expensesContainer;    
            html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-outline"></ion-icon></button></div></div></div>';
            }
            
            //replace the placeholder text with some actual data
            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%description%', obj.description);
            newhtml = newhtml.replace('%value%', formatNumber(obj.value, type));
            
            //insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
            
        },
        
        deleteListItem: function(selectorID){
            var el =document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        
        //for clearing the value anddesc field once we have entered some value
        clearfields: function(){
        var fields, fieldsArr;
        //this will return list 
        fields = document.querySelectorAll(Domstrings.descriptionType + ', ' + Domstrings.valueType);    
        //now we will convert that list obj into Array
        fieldsArr=Array.prototype.slice.call(fields);
        fieldsArr.forEach(function(current){
         current.value="";    
        });
        //for taking cursor back to the description field after submitting the value    
        fieldsArr[0].focus();
            
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type='inc' : type='exp';
            
            document.querySelector(Domstrings.budgetLabel).textContent=formatNumber(obj.budget, type);
            document.querySelector(Domstrings.incomeLabel).textContent=formatNumber(obj.totalInc, 'inc');
            document.querySelector(Domstrings.expensesLabel).textContent=formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(Domstrings.percentageLabel).textContent=obj.percentage +'%';
            }
            else{
                document.querySelector(Domstrings.percentageLabel).textContent='---';
            }
            
        },
        
        displaypercentages:function(percentages){
            //this will return node list
            var fields=document.querySelectorAll(Domstrings.expensesPercLabel);
            
            var nodeListForEach = function(list, callback){
                for(var i=0; i< list.length; i++){
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){        
                    current.textContent=percentages[index] + '%';
                }
                else{
                    current.textContent='---';
                }
            });
            
        },
        
        displayMonth: function(){
            var year, now;
            var now= new Date();
            var month = now.getMonth();
            var months =['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October', 'November', 'December'];
            
            
            year= now.getFullYear();
            document.querySelector(Domstrings.dateLabel).textContent=months[month] + ' ' + year;
        },
        
        //second object's parameter which we alsowant to return in controller 
        getDOMstrings: function(){
            return Domstrings;
        }
        
    }
    
    
})();

//-------------------------------------CONTROLLER-----------------------------------
var Controller=( function(budgetCtrl, UICtrl){
    
    //setting up init function
    var setupEventListeners= function(){
        
    var DOM=UICtrl.getDOMstrings();
        
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        
    //for getting the value when enter is pressed    
    document.addEventListener('keydown',function(event){

        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }
        
    });
        
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);    
        
    };
    
    var updateBudget= function(){
        var budget;
    //1. calculate the budget
      budgetCtrl.calculateBudget();
        
    // 2. return the budget    
        budget=budgetCtrl.getBudget();
        
    //3. update the budget on UI
       UICtrl.displayBudget(budget);
        
    }
    
    var updatePercentages= function(){
        
        //1. calculate the percentages
            budgetCtrl.calculatePercentages();
        //2. read percentages frombudget controller
            var percentages=budgetCtrl.getPrcentages();
        //3. update the user interface
        UICtrl.displaypercentages(percentages);
        
    }
    
    //whenever any items will be entered, this function will be called
    var ctrlAddItem= function(){
        var input, newItem
    // 1. get the input field data
      
    input = UICtrl.getinput();
    
    //for not entering anything if user enteres anything without actual data
    if(input.description !== "" && !isNaN(input.value) && input.value >0){
    
        
    //2.  add the item to the budgetcontroller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    budgetCtrl.testing();    
        
    //3. add the new item to the ui
    UICtrl.addListItem(newItem, input.type);    
    
    //4 for clearing the field 
    UICtrl.clearfields();    
        
    //5. calculate and update the budget
    updateBudget(); 
    
    //6. update and caluclate percentages
    updatePercentages();    
        
        }    
    }
    //-------------------------------------DELETING ITEM------------------------------------------
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        //itemid will be given as inc-1, inc-2, exp-1, exp-2 etc
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);
        if(itemID){
            //so we will split that string by - so we can get only id number directly and deletethat obj later
            splitID=itemID.split('-');
            type=splitID[0];
            //here this ID's type willbe string so that's why we need to convert that into number so we can pass it to the deleteItem
            ID=parseInt(splitID[1]);
            //1. delete the item from DS
            budgetCtrl.deleteItem(type, ID);
            
            //2. delete the item from UI
            UICtrl.deleteListItem(itemID);
            
            //3. update and show the budget
            updateBudget();
            
            //4. update and caluclate percentages
            updatePercentages();    
            
        }
    }
    
    return {
        init : function(){
        console.log("application has started");
            UICtrl.displayMonth();
        //this is for setting all the initial expenses and income and % values to zero
            UICtrl.displayBudget({
              budget: 0,
              totalInc: 0,
              totalExp: 0,
              percentage: -1
            });    
         return setupEventListeners();
        }
    }
    
    
    
})(budgetController,UIController);

//without putting this function outside noting can be done at all.
Controller.init();








 


