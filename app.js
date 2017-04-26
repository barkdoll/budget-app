// BUDGET CONTROLLER
var budgetController = (function() {

   var Expense = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
   }

   Expense.prototype.calcPercentage = function(totalIncome) {
       if (totalIncome > 0) {
           this.percentage = Math.round((this.value / totalIncome) * 100);
       } else {
           this.percentage = -1;
       }
   };

   Expense.prototype.getPercentage = function() {
       return this.percentage;
   };

   var Income = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
   }

   var calculateTotal = function(type) {
       var sum = 0;
       data.allItems[type].forEach(function(current) {
           sum += current.value;
       });

       data.totals[type] = sum;
   }

   var data = {
       allItems: {
           exp: [],
           inc: []
       },
       totals: {
           exp: 0,
           inc: 0
       },
       budget: 0,
       percentage: -1
   };

   return {
       addItem: function(type, des, val) {
           var newItem, ID;

           // Create new ID
           if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id
        } else {
            ID = 0;
        }

           // Creates new item based on inc/exp type
           if (type === 'exp') {
               newItem = new Expense(ID, des, val);
           } else if (type === 'inc') {
               newItem = new Income(ID, des, val);
           }

           // Pushes it into the data structure.
           data.allItems[type].push(newItem);


           // return the new element
           return newItem;
       },

       deleteItem: function(type, id) {
           var ids, index;

           ids = data.allItems[type].map(function(current) {
               return current.id;
           });

           index = ids.indexOf(id);

           if (index !== -1) {
               data.allItems[type].splice(index, 1);
           }
       },

       calculateBudget: function() {
           // calculate total income and expenses
           calculateTotal('exp');
           calculateTotal('inc');

           // calculate the budget: income - expenses
           data.budget = data.totals.inc - data.totals.exp;

           // calculate the percentage of income that we spent and converts the decimal to a percentage (by multiplying by 100, you have the number in percentage form)
           if (data.totals.inc > 0) {
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
           } else {
               data.percentage = -1;
           }
       },

       calculatePercentages: function() {
           // a=20; b=10; c=40;
           // income = 100;
           // a = 20% / b = 10% / c = 40%

           data.allItems.exp.forEach(function(cur) {
              cur.calcPercentage(data.totals.inc);
           });
       },

       getPercentages: function() {
           var allPercentages = data.allItems.exp.map(function(cur) {
               return cur.getPercentage();
           });
           return allPercentages;
       },

       getBudget: function() {
           return {
               budget: data.budget,
               totalInc: data.totals.inc,
               totalExp: data.totals.exp,
               percentage: data.percentage
           }
       },

       testing: function() {
           console.log(data);
       }
   }

})();

// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        // Adds exactly 2 decimals for cents
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];


        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' +  int.substr(int.length - 3, 3);
        };

        dec = numSplit[1];


        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (i=0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                // and object is returned with the values of each field
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },

        addListItem: function(obj, type) {
            var html, newHTML, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;

            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
            // Replace the placeholder text with some actual data
            newHTML = html.replace('%id', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID) {
            var item = document.getElementById(selectorID);
            item.parentNode.removeChild(item);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '—';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '—';
                }


            });
        },

        displayMonth: function() {
            var now, year, month, months;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;


        },

        changeType: function() {

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            console.log(fields);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function() {
            // exposes private DOMstrings variable to public
            return DOMstrings;
        }
    }

})();

// APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        // retrieves the DOMstrings object from the UI controller
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {
            // event.which is something you use to support older browsers that don't use keyCodes
            if (e.keyCode === 13 || event.which === 13) {
            document.querySelector(DOM.inputBtn).click();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {
        // 01 Calculate the budget
        budgetCtrl.calculateBudget();

        // 02 Return the budget
        var budget = budgetCtrl.getBudget();

        // 03 display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update UI with new percentage
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        // 01 get the filed input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 02 add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 03 add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 04 Clear the fields
            UICtrl.clearFields();

            // 05 Calculate and update budget
            updateBudget();

            // 06 Calculate and update percentages
            updatePercentages();
        }

    };

    // This function shows how event bubbling works.
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        };

        // 01 Delete item from the data structure
        budgetCtrl.deleteItem(type, ID);

        // 02 Delete item from UI
        UICtrl.deleteListItem(itemID);

        // 03 Update and show new budget total
        updateBudget();

        // 04 Calculate and update percentages
        updatePercentages();
    };

    return {
        init: function() {
            console.log('app initialized!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();
