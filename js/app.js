/* 
@@@------angular js script for expense calulator----------@@@
@@@------developed by Himanshu Khatri---------------------@@@
*/

var expenseApp = angular.module('expenseApp', ['ui.bootstrap']);
var controllers = {};
var groupByWeek = {};




    //-------------dashboard controller which contains all related functions with dashboard page.--
    controllers.DashboardController = function ($scope, $timeout, $http, AppFactory) {
        $scope.expenses = [];
        $scope.expensesByWeek = [];
        $scope.maxNumberOfExpenses = 100000;
        $scope.getExpenses = function () {

            if ((angular.isNumber($scope.maxNumberOfExpenses)) && ($scope.maxNumberOfExpenses > 0)) {
                if (localStorage.getItem("ExpenseData")) {
                    $scope.expenses = JSON.parse(localStorage.getItem("ExpenseData"));
                }

            }

        };



    // ------------------get list of all expenses group by week-------------------------------
    $scope.GetExpensesByWeek = function () {
        groupByWeek = {};
        $scope.expensesByWeek = [];
        $scope.expenses.forEach(function (d, i) {
            var weekYear = d['date'].slice(0, 4) + '-' + new Date(d['date']).getWeekNumber();
            if (groupByWeek.hasOwnProperty(weekYear)) {
                groupByWeek[weekYear].push(d);
            } else {
                groupByWeek[weekYear] = [d];
            }
        });
        angular.forEach(groupByWeek, function (value, key) {
            var sum = value.sum("amount")
            $scope.expensesByWeek.push({ week: key, amount: sum });
        });
    }



    // ----------------add new expenses to the storage--------------------------------------
    $scope.addExpense = function () {

        if ($scope.newExpense === undefined) {
            return;
        }
        if ($scope.newExpense.amount === undefined) {
            return;
        }
        if ($scope.newExpense.description === undefined) {
            return;
        }

        if (isNaN(parseFloat($scope.newExpense.amount))) {
            return;
        }

        var today = new Date();
        var newExpense = $scope.newExpense;
        $scope.expenses.push({
            id: guid(),
            date: today.toISOString(),
            amount: newExpense.amount,
            description: newExpense.description,
            editing: false
        });

        localStorage.setItem("ExpenseData", JSON.stringify($scope.expenses));
        $scope.newExpense = null;
        AppFactory.load();
    };



    // ------------------update expense store , amount and description---------------------
    $scope.updateExpense = function (expense) {
        localStorage.setItem("ExpenseData", JSON.stringify($scope.expenses));
    };



    // -------------------delete a expenses------------------------------------------------
    $scope.removeExpense = function (expense) {
        if (confirm('Are you sure you want to remove this expense?')) {
            var index = $scope.expenses.indexOf(expense);
            $scope.expenses.splice(index, 1);
            localStorage.setItem("ExpenseData", JSON.stringify($scope.expenses));
            AppFactory.load();
        }
    };



    //-----------------get total of all expense amount till date----------------------------
    $scope.totalExpenseAmount = function () {
        var sum = 0;
        for (var i = 0, v; v = $scope.expenses[i]; i++) {
            if (v.amount !== '') {
                sum += parseFloat(v.amount);
            }
        }
        return sum;
    };



    // ---------------conevert row into edit mode.---------------------------------------------
    $scope.editExpense = function (expense) {
        expense.editing = true;
    };



    //-----------------event fires on save ok click after updating a row value----------------
    $scope.saveExpense = function (expense) {
        expense.editing = false;
        $scope.updateExpense(expense);
        AppFactory.load();
    };


   //-----------------event fires on save ok click after updating a row value----------------
    $scope.$watch('expenses', function () {
        $scope.GetExpensesByWeek();
    }, true);



    //----------------init function call on page load and load all list of expenses----------
    function init() {
        $scope.getExpenses();
    }


    init();
};

    // ---------------factory to get data from localStorage----------------------------------
    expenseApp.factory('AppFactory', ['$http',
        function ($http, $scope) {
            var myData = {};
            myData.data = '';
            myData.load = function () {
                this.data = [];
                if (localStorage.getItem("ExpenseData")) {
                    this.data = JSON.parse(localStorage.getItem("ExpenseData"));
                }
                return this.data;
            };
            myData.get = function () {

                return this.data === '' ? this.load() : this.data;
            };
            return myData;
        }
    ]);



    // -------------navbar controller------------------------------------------------------
    expenseApp.controller('NavController', function ($scope, $location) {
        $scope.isActive = function (route) {
            return route === $location.path();
        }
    });



    // -------------Controllers to open a popup modal to show about the app-----------------
    var ModalController = function ($scope, $modal) {

        $scope.open = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/about.html',
                controller: ModalInstanceController
            });
        };
    };


    // -------------Modal Controllers-------------------------------------------------------
    var ModalInstanceController = function ($scope, $modalInstance) {
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };



    // ---------------Form amount validation--------------------------------------------------
    var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;


    //----------------custom directive to support float type value------------------------------
    expenseApp.directive('smartFloat', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (FLOAT_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('float', true);
                        return parseFloat(viewValue.replace(',', '.'));
                    } else {
                        ctrl.$setValidity('float', false);
                        return undefined;
                    }
                });
            }
        };
    });



    //---------Router configuration------------------------------------------------------------
    expenseApp.config(function ($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                controller: controllers.DashboardController,
                templateUrl: 'templates/dashboard.html'
            })
            .otherwise({
                redirectTo: '/dashboard'
            });
    });

