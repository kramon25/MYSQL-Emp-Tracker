// worked with Keller on this

const inquirer = require("inquirer");
const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Thenew52!",
  database: "employee_db",
});

app.get("/", (req, res) => {
  db.promise()
    .query("SELECT * FROM employee")
    .then(([rows]) => {
      console.log(rows);
      return res.json(rows);
    })
    .catch((error) => {
      console.log(error);
      return res.json(error);
    });
});



db.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + db.threadId);
  afterConnection();
});

// function after connection is established and welcome image shows
afterConnection = () => {
  console.log("***********************************");
  console.log("*                                 *");
  console.log("*          MANAGER PORTAL         *");
  console.log("*                                 *");
  console.log("***********************************");
  userPrompt();
};

// Prompts for user to answer
function userPrompt() {
  inquirer.prompt([
      {
        type: "list",
        name: "choices",
        message: "How would you like to continue?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Delete Employee",
          "View department budgets",
          "No Action",
        ],
      },
    ])
    .then((answers) => {
      const { choices } = answers;
      console.log(answers);
      if (choices === "View all departments") {
        showDepartments();
      }

        if (choices === "View all roles") {
          showRoles();
        }

        if (choices === "View all employees") {
          showEmployees();
        }

        if (choices === "Add a department") {
          addDepartment();
        }

        if (choices === "Add a role") {
          addRole();
        }

        if (choices === "Add an employee") {
          addEmployee();
        }

        if (choices === "Update an employee role") {
          updateEmployee();
        }

        if (choices === "Delete Employee"){
          deleteEmployee();
        }
        
      if (choices === "View department budgets") {
        viewBudget();
      }

        if (choices === "No Action") {
          db.end();
        }
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.log("Prompt couldn't be rendered in the current environment.");
      } else {
        console.log(error);
      }
    });
}

// function to show all departments
showDepartments = () => {
  console.log("Showing all departments...\n");
  const sql = `SELECT department.id AS id, department.name AS Department FROM department`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};
showRoles = () => {
  console.log("Showing all roles...\n");
  const sql = `SELECT role.id AS id, role.title AS Roles, role.salary AS Salary FROM role`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};

// function showing employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
function showEmployees () {
  console.log("Showing all employees...\n");
  const sql = `SELECT a.role_id, a.first_name, a.last_name, b.title, c.name, b.salary, a.manager_id
  FROM employee a JOIN role b on (a.role_id = b.id) JOIN department c on (b.department_id = c.id)`;
 
  

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    userPrompt();
  });
};


// function to add department
function addDepartment() {
  inquirer.prompt([{
      type: "input",
      name: "action",
      message: "What department would you like to add?",
}])
.then(answers => {
  db.query("INSERT INTO department (name) VALUES (?)", answers.action, (err, res) => {
    if (err) throw err;
    console.table(res);
    showDepartments();
  })
})
};


// function to add role
function addRole() {

  const questions = [
    {
      type: "input",
      name: "title",
      message: "what is the title of the new role?(Please use single quotes)"
    },
    {
      type: "input",
      name: "salary",
      message: "what is the salary of the new role?"
    },
    {
      type: "input",
      name: "department_id",
      message: "which # department is this role in?(1-4)"
    }
  ];
  
  inquirer.prompt(questions)
  .then(answers => {
  db.query(`INSERT INTO role (title, salary, department_id) VALUES (${answers.title}, ${answers.salary}, ${answers.department_id})`, answers.action, (err, res) => {
    if (err) throw err;
    console.table(res);
    userPrompt();
      })
    })
  };
  
  
  
  // function to add an employee
  function addEmployee() {
  
    const questions = [
      {
        type: "input",
        name: "first_name",
        message: "what is the first name of this employee?(Please use single quotes)"
      },
      {
        type: "input",
        name: "last_name",
        message: "what is the last name of this employee?(Please use single quotes)"
      },
      {
        type: "input",
        name: "role_id",
        message: "what is the role id of this employee?(1-7)"
      },
      {
        type: "input",
        name: "manager_id",
        message: "what is the id of the manager of this employee?(1-7 or NULL if none)"
      }
    ];
  
  inquirer.prompt(questions)
  .then(answers => {
  db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (${answers.first_name}, ${answers.last_name}, ${answers.role_id}, ${answers.manager_id})`, answers.action, (err, res) => {
    if (err) throw err;
    console.table(res);
    userPrompt();
      })
    })
  };

        // function to update an employee 
        updateEmployee = () => {
          db.query(`SELECT * FROM role;`, (err, res) => {
              if (err) throw err;
              let roles = res.map(role => ({name: role.title, value: role.id }));
              db.query(`SELECT * FROM employee;`, (err, res) => {
                  if (err) throw err;
                  let employees = res.map(employee => ({name: employee.first_name + ' ' + employee.last_name, value: employee.role_id }));
                  inquirer.prompt([
                      {
                          name: 'employee',
                          type: 'list',
                          message: 'Which employee would you like to update the role for?',
                          choices: employees
                      },
                      {
                          name: 'newRole',
                          type: 'list',
                          message: 'What should the employee\'s new role be?',
                          choices: roles
                      },
                  ]).then((response) => {
                      db.query(`UPDATE employee SET ? WHERE ?`, 
                      [
                          {
                              role_id: response.newRole,
                          },
                          {
                              role_id: response.employee,
                          },
                      ], 
                      (err, res) => {
                          if (err) throw err;
                          console.log(`\n Successfully updated employee's role in the database! \n`);
                          userPrompt();
                      })
                  })
              })
          })
      }
          // function to delete employees
function deleteEmployee() {
  // get employees from employee table 
  const employeeSql = `SELECT * FROM employee`;

  db.query(employeeSql, (err, data) => {
    if (err) throw err; 

  const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to delete?",
        choices: employees
      }
    ])
      .then(empChoice => {
        const employee = empChoice.name;

        const sql = `DELETE FROM employee WHERE id = ?`;

        db.query(sql, employee, (err, result) => {
          if (err) throw err;
          console.log("Successfully Deleted!");
        
          showEmployees();
    });
  });
 });
};




        //function to view department budget 
function viewBudget() {
  console.log('Showing budget by department...\n');

  const sql = `SELECT department_id AS id, 
                      department.name AS department,
                      SUM(salary) AS budget
               FROM  role  
               JOIN department ON role.department_id = department.id GROUP BY  department_id`;
  
  db.query(sql, (err, rows) => {
    if (err) throw err; 
    console.table(rows);

    userPrompt(); 
  });            
};
