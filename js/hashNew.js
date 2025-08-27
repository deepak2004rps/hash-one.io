const SPONGE_STATE_SIZE = 161;
const P_SIZE = 80;
const Q_SIZE = 81;

// Modal and Throbber elements
const dialog = document.getElementById('dialog');
const throbber = document.getElementById('throbber');
const closeButton = document.querySelector('.close-button');
const closeDialogButton = document.getElementById('closeDialogButton');
const dialogMessage = document.getElementById('dialogMessage');
const dialogHash = document.getElementById('dialogHash');
const convertButton = document.getElementById('convertButton');
const copyButton = document.getElementById('copyButton');
let currentHashValue = '';

// Helper function to show the modal
function showDialog(message, hash = '') {
    dialogMessage.textContent = message;
    dialogHash.textContent = hash;
    currentHashValue = hash;
    
    if (hash) {
        convertButton.style.display = 'inline-block';
        copyButton.style.display = 'inline-block';
    } else {
        convertButton.style.display = 'none';
        copyButton.style.display = 'none';
    }
    
    // Reset copy button text
    copyButton.textContent = 'Copy Bits';

    dialog.style.display = 'flex';
}

// Helper function to convert binary string to hexadecimal
function convertToHex(binaryString) {
    let hexString = '';
    // Pad the binary string to a multiple of 4
    const paddedBinary = binaryString.padStart(Math.ceil(binaryString.length / 4) * 4, '0');
    for (let i = 0; i < paddedBinary.length; i += 4) {
        const chunk = paddedBinary.substring(i, i + 4);
        hexString += parseInt(chunk, 2).toString(16);
    }
    return hexString;
}

// Helper function to convert hex to binary
function convertHexToBinary(hexString) {
    let binaryString = '';
    // Remove '0x' prefix if present
    const cleanHex = hexString.startsWith('0x') ? hexString.substring(2) : hexString;

    // Ensure the hex string has a length that is a multiple of 4 bits (1 hex char)
    const paddedHex = cleanHex.padStart(Math.ceil(160 / 4), '0'); // 160 bits = 40 hex chars
    
    for (let i = 0; i < paddedHex.length; i++) {
        binaryString += parseInt(paddedHex[i], 16).toString(2).padStart(4, '0');
    }
    return binaryString.substring(0, 160); // Return exactly 160 bits
}

// Generate the first 161 bits of Pi in binary
function getPiBits() {
    // Pi = 3.1415926535897932384626433832795028841971693993751...
    // We need the fractional part for the binary representation
    const piFractional = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
    
    // Convert to binary by multiplying by 2 repeatedly
    let binary = '';
    let fraction = piFractional;
    
    for (let i = 0; i < SPONGE_STATE_SIZE; i++) {
        // Multiply by 2
        let carry = 0;
        let newFraction = '';
        
        for (let j = 0; j < fraction.length; j++) {
            const digit = parseInt(fraction[j]) * 2 + carry;
            if (digit >= 10) {
                newFraction += (digit - 10).toString();
                carry = 1;
            } else {
                newFraction += digit.toString();
                carry = 0;
            }
        }
        
        binary += carry.toString();
        fraction = newFraction;
        
        // Remove leading zeros and ensure we have enough precision
        while (fraction.length < 100) {
            fraction += '0';
        }
    }
    
    return binary.split('').map(bit => parseInt(bit));
}

// Helper function to convert a single byte to an array of 8 bits
function byteToBits(byte) {
    const bits = [];
    for (let i = 7; i >= 0; i--) {
        bits.push((byte >> i) & 1);
    }
    return bits;
}

function calculateHash() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showDialog('Please choose a file.');
        return;
    }

    throbber.style.display = 'flex'; // Show throbber

    const reader = new FileReader();
    reader.onload = function (e) {
        // Use setTimeout to allow the UI to update and show the throbber
        // before the potentially blocking calculation starts.
        setTimeout(() => {
            const fileContent = new Uint8Array(e.target.result);
            const messageBits = Array.from(fileContent).flatMap(byte => byteToBits(byte));

            // Initialize state with first 161 bits of Pi
            const state = getPiBits();
            
            // Perform sponge construction
            spongeConstruction(state, messageBits);

            // Extract 160-bit hash from state
            const hashBits = state.slice(0, 160); // Take first 160 bits as per paper
            const hashValue = hashBits.join('');

            

            showDialog('Hash Generated (Binary):', hashValue);
            throbber.style.display = 'none'; // Hide throbber
        }, 50); // A small delay to ensure UI updates
    };

    reader.readAsArrayBuffer(file);
}

function verifyHash() {
    const fileInput = document.getElementById('fileInput');
    const verifyHashInput = document.getElementById('Verify_hash').value.trim();
    const verifyValueDiv = document.getElementById('verifyvalue');
    
    const file = fileInput.files[0];
    if (!file) {
        showDialog('Please choose a file to verify.');
        return;
    }
    
    if (!verifyHashInput) {
        showDialog('Please enter a hash value to verify.');
        return;
    }

    throbber.style.display = 'flex'; // Show throbber

    const reader = new FileReader();
    reader.onload = function (e) {
        setTimeout(() => {
            const fileContent = new Uint8Array(e.target.result);
            const messageBits = Array.from(fileContent).flatMap(byte => byteToBits(byte));

            // Initialize state with first 161 bits of Pi
            const state = getPiBits();
            
            // Perform sponge construction
            spongeConstruction(state, messageBits);

            // Extract 160-bit hash from state
            const hashBits = state.slice(0, 160);
            const rehashedValue = hashBits.join('');
            
            let inputAsBinary;
            const cleanedInput = verifyHashInput.replace(/0x/i, '');
            
            const isBinary = /^[01]+$/.test(verifyHashInput);
            const isHex = /^[0-9a-fA-F]+$/.test(cleanedInput);
            
            if (isBinary) {
                inputAsBinary = verifyHashInput.padStart(160, '0'); // Ensure 160 bits
            } else if (isHex) {
                inputAsBinary = convertHexToBinary(verifyHashInput);
            } else {
                verifyValueDiv.innerHTML = "Invalid hash format. Please use binary (0s and 1s) or hexadecimal (0-9, a-f).";
                verifyValueDiv.style.color = "red";
                throbber.style.display = 'none'; // Hide throbber
                return;
            }

            if (rehashedValue === inputAsBinary) {
                verifyValueDiv.innerHTML = "Hash matched. File is authentic.";
                verifyValueDiv.style.color = "green";
            } else {
                verifyValueDiv.innerHTML = "Hash did not match. File may be corrupted or altered.";
                verifyValueDiv.style.color = "red";
            }
            throbber.style.display = 'none'; // Hide throbber
        }, 50);
    };

    reader.readAsArrayBuffer(file);
}

// Corrected sponge construction as per the research paper
function spongeConstruction(state, message) {
    const k = message.length;
    
    if (k === 0) {
        // Handle empty message case
        updateFunction(state, 324);
        return;
    }
    
    // Absorption phase
    if (k >= 1) {
        // First message bit: XOR with S[160], then 324 rounds
        state[160] ^= message[0];
        updateFunction(state, 324);
    }
    
    // Intermediate message bits: XOR with S[160], then 162 rounds each
    for (let i = 1; i < k - 1; i++) {
        state[160] ^= message[i];
        updateFunction(state, 162);
    }
    
    // Last message bit (if k > 1): XOR with S[160], then 324 rounds
    if (k > 1) {
        state[160] ^= message[k - 1];
        updateFunction(state, 324);
    }
    
    // Squeezing phase: Generate 160 output bits
    const hashOutput = [];
    for (let i = 0; i < 160; i++) {
        updateFunction(state, 1); // Single round per squeeze
        hashOutput.push(state[160]);
    }
    
    // Replace first 160 bits of state with squeezed output
    for (let i = 0; i < 160; i++) {
        state[i] = hashOutput[i];
    }
}

// Update function implementing the permutation as per research paper
function updateFunction(state, rounds) {
    let P = state.slice(0, P_SIZE);
    let Q = state.slice(P_SIZE, SPONGE_STATE_SIZE);

    for (let r = 0; r < rounds; r++) {
        // Compute the non-linear functions as defined in the paper
        // Pf(P0, P11, Q23, P55) = (P0*P11 ⊕ P0*P55 ⊕ P11*Q23 ⊕ Q23*P55 ⊕ Q23 ⊕ P55) ⊕ 1
        const Pf = (P[0] & P[11]) ^ (P[0] & P[55]) ^ (P[11] & Q[23]) ^ (Q[23] & P[55]) ^ Q[23] ^ P[55] ^ 1;
        
        // Qf(Q0, Q25, Q41, P48) = (Q25*P48 ⊕ Q25*Q41 ⊕ Q0*P48 ⊕ Q0*Q41 ⊕ Q25 ⊕ Q41)
        const Qf = (Q[25] & P[48]) ^ (Q[25] & Q[41]) ^ (Q[0] & P[48]) ^ (Q[0] & Q[41]) ^ Q[25] ^ Q[41];
        
        // Lf(P1, Q1, P50) = P1 ⊕ Q1 ⊕ P50
        const Lf = P[1] ^ Q[1] ^ P[50];

        // Calculate new rightmost bits
        const newP79 = Pf ^ Lf;
        const newQ80 = Qf ^ Lf;

        // Shift registers left and insert new bits
        for (let i = 0; i < P_SIZE - 1; i++) {
            P[i] = P[i + 1];
        }
        P[P_SIZE - 1] = newP79;

        for (let i = 0; i < Q_SIZE - 1; i++) {
            Q[i] = Q[i + 1];
        }
        Q[Q_SIZE - 1] = newQ80;
    }

    // Update the state array
    for (let i = 0; i < P_SIZE; i++) {
        state[i] = P[i];
    }
    for (let i = P_SIZE; i < SPONGE_STATE_SIZE; i++) {
        state[i] = Q[i - P_SIZE];
    }
}

// --- EVENT LISTENERS FOR MODAL ---
closeButton.addEventListener('click', () => {
    dialog.style.display = 'none';
});

closeDialogButton.addEventListener('click', () => {
    dialog.style.display = 'none';
});

convertButton.addEventListener('click', () => {
    dialogHash.textContent = '0x' + convertToHex(currentHashValue);
    convertButton.style.display = 'none';
    copyButton.textContent = 'Copy Hex';
});

copyButton.addEventListener('click', () => {
    const textToCopy = dialogHash.textContent;
    try {
        // Use the modern clipboard API
        navigator.clipboard.writeText(textToCopy).then(() => {
            dialogMessage.textContent = 'Copied to clipboard!';
        }).catch(() => {
            // Fallback for browsers that don't support it
            const tempInput = document.createElement('textarea');
            tempInput.value = textToCopy;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            dialogMessage.textContent = 'Copied to clipboard!';
        });
    } catch (err) {
        // Fallback for browsers that don't support it
        const tempInput = document.createElement('textarea');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        dialogMessage.textContent = 'Copied to clipboard!';
    }
});

window.addEventListener('click', (event) => {
    if (event.target === dialog) {
        dialog.style.display = 'none';
    }
});
