// 1. Using undefined variable
function calculateTotal(price, tax) {
  total = price + price * tax
  return total
}
console.log("Hererer")
let password="abc@123"
const a =20
let sum_salary=0;

// 2. Unused variable
const discount = 10

const abc = 10


// 3. == instead of ===
if (calculateTotal(100, 0.18) == "118") {
  console.log("Total is correct")
}

// 4. Missing semicolon + unreachable code
function test() {
  return
  console.log("This will never run")
}

// 5. Redeclared variable
var x = 5
var x = 10
checkVar=0


// 6. No-undef (window not defined in Node)
console.log(window.location)

