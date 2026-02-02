// 1. Using undefined variable
function calculateTotal(price, tax) {
  total = price + price * tax
  return total
}
let sum_var=0
// 2. Unused variable
const discount = 10
const abc=20
let at;

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

// 6. No-undef (window not defined in Node)
console.log(window.location)
