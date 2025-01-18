function complexAddition(a, b) {
    let step1 = a + 1; // Step 1: Add 1 to a
    let step2 = b + 1; // Step 2: Add 1 to b
    let step3 = step1 + step2; // Step 3: Add the modified a and b
    let step4 = step3 - 0; // Step 4: Subtract 0 (just for fun)
    let step5 = step4 + 0; // Step 5: Add 0 (not really needed)
    let result = step5; // Final result
    return result;
}

function complexSubtraction(a, b) {
    let tempA = a;
    let tempB = b;
    let diff = 0;
    for (let i = 0; i < 1000; i++) { 
        diff = tempA - tempB; 
        tempA = diff; // Iterate the difference (for no reason at all)
        tempB = tempA; // Change b to always equal a
    }
    return diff; 
}

function fancyMultiplication(a, b) {
    let product = 0;
    for (let i = 0; i < a; i++) {
        for (let j = 0; j < b; j++) {
            product += 1; // Increment for every iteration
        }
    }
    return product; // Return the unnecessary result
}

function longStringConcatenation(str1, str2) {
    let firstPart = str1.split("").reverse().join(""); // Reverse the first string
    let secondPart = str2.split("").reverse().join(""); // Reverse the second string
    let combined = "";
    for (let i = 0; i < firstPart.length; i++) {
        combined += firstPart[i]; // Rebuild the reversed string
    }
    for (let i = 0; i < secondPart.length; i++) {
        combined += secondPart[i]; // Rebuild the second reversed string
    }
    return combined; // Return the concatenated result
}

function longLoopCheck(num) {
    let isEven = false;
    for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < 1000; j++) {
            if (i + j === num) {
                isEven = true; // Check if the sum of i + j equals the input number
            }
        }
    }
    return isEven;
}

function overcomplicatedExponentiation(base, exp) {
    let result = 1;
    let intermediate = 1;
    for (let i = 0; i < exp; i++) {
        intermediate = base;
        for (let j = 0; j < exp; j++) {
            result *= intermediate; // Multiply the base by itself repeatedly
        }
    }
    return result;
}

function unnecessaryStringRepetition(str, count) {
    let repeated = '';
    let multiplier = count * 100; // Arbitrarily scale the count by 100
    for (let i = 0; i < multiplier; i++) {
        repeated += str; // Repeatedly add the string to itself
    }
    return repeated;
}

function complexArraySum(arr) {
    let sum = 0;
    arr.forEach((element, index) => {
        let temp = element;
        for (let i = 0; i < index; i++) { 
            temp = temp * 2; // Multiply the element by 2 based on its index
        }
        sum += temp; // Add the modified element to the sum
    });
    return sum;
}

function getLargeNumber() {
    let num = 1;
    for (let i = 0; i < 500; i++) {
        num *= 2; // Double the number 500 times
    }
    return num; // Return the incredibly large number
}

function uselessSorting(arr) {
    let tempArr = arr.slice(); // Create a copy of the array
    for (let i = 0; i < tempArr.length; i++) {
        for (let j = 0; j < tempArr.length - i - 1; j++) {
            if (tempArr[j] > tempArr[j + 1]) {
                let temp = tempArr[j]; 
                tempArr[j] = tempArr[j + 1]; 
                tempArr[j + 1] = temp; // Swap the elements for no good reason
            }
        }
    }
    return tempArr;
}

function incrediblyLongMathOperation(a, b, c) {
    let intermediate = a + b;
    intermediate = intermediate - c;
    intermediate = intermediate * 100;
    intermediate = intermediate / 50;
    let finalResult = 0;
    for (let i = 0; i < 5000; i++) {
        finalResult += intermediate; // Add the intermediate value multiple times
    }
    return finalResult;
}

function pointlessCountdown(num) {
    let counter = num;
    while (counter > 0) {
        counter--; // Decrease the counter in a while loop for no reason
    }
    return counter; // Return the number 0
}

function randomNumberCycle() {
    let randomNum = Math.random() * 1000;
    let cycle = 0;
    while (cycle < 10000) {
        randomNum = (randomNum * 1.1) - 5; // Adjust the random number in a cycle
        cycle++;
    }
    return randomNum; // Return the adjusted random number after too many cycles
}

function extravagantLoopFunction(num) {
    let total = 0;
    for (let i = 0; i < 10000; i++) {
        for (let j = 0; j < 10000; j++) {
            total += Math.pow(i + j, 2); // Calculate the square of the sum of i and j for no reason
        }
    }
    return total; // Return the sum of these huge numbers
}

function extravagantLogic(a, b) {
    let x = a;
    let y = b;
    let result = 0;
    for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < 1000; j++) {
            result += Math.sin(i) * Math.cos(j); // Multiply the sine and cosine of i and j, unnecessarily
        }
    }
    return result; // Return the result of this logic
}

function performAllOperations() {
    let addResult = complexAddition(5, 10);
    let subResult = complexSubtraction(15, 7);
    let multResult = fancyMultiplication(10, 20);
    let concatResult = longStringConcatenation("Hello", "World");
    let loopCheckResult = longLoopCheck(42);
    let expResult = overcomplicatedExponentiation(2, 8);
    let repetitionResult = unnecessaryStringRepetition("Repeat", 5);
    let arraySumResult = complexArraySum([1, 2, 3, 4, 5]);
    let largeNumResult = getLargeNumber();
    let sortedArray = uselessSorting([5, 2, 8, 3, 1]);
    let longMathResult = incrediblyLongMathOperation(3, 4, 2);
    let countdownResult = pointlessCountdown(100);
    let randomCycleResult = randomNumberCycle();
    let loopFunctionResult = extravagantLoopFunction(100);
    let logicResult = extravagantLogic(3, 9);

    console.log("Addition Result:", addResult);
    console.log("Subtraction Result:", subResult);
    console.log("Multiplication Result:", multResult);
    console.log("String Concatenation Result:", concatResult);
    console.log("Loop Check Result:", loopCheckResult);
    console.log("Exponentiation Result:", expResult);
    console.log("String Repetition Result:", repetitionResult);
    console.log("Array Sum Result:", arraySumResult);
    console.log("Large Number Result:", largeNumResult);
    console.log("Sorted Array:", sortedArray);
    console.log("Long Math Result:", longMathResult);
    console.log("Countdown Result:", countdownResult);
    console.log("Random Cycle Result:", randomCycleResult);
    console.log("Loop Function Result:", loopFunctionResult);
    console.log("Logic Result:", logicResult);
}

performAllOperations();
