# Hash-One  
### A Lightweight Cryptographic Hash Function for Constrained Environments

## 📌 Overview

**Hash-One** is a lightweight cryptographic hash function designed for **resource-constrained environments** such as RFID systems, IoT devices, embedded systems, and low-power sensors.  
The project demonstrates a **sponge-based hashing construction** combined with **Non-Linear Feedback Shift Registers (NFSRs)** to achieve efficient diffusion and non-linearity with minimal computational overhead.

The implementation is showcased through a **web-based interactive hash generator**, allowing users to input data and observe the generated hash output in real time.

🔗 **Live Demo:**  
https://deepak2004rps.github.io/hash-one.io/

---

## 🎯 Objectives

- Design a **lightweight hash algorithm** suitable for low-resource devices  
- Demonstrate **secure diffusion and avalanche effect**
- Provide a **simple, educational, and interactive implementation**
- Showcase cryptographic concepts in an **accessible web interface**

---

## ⚙️ Design Principles

- **Lightweight computation** – minimal memory and processing requirements  
- **Sponge construction** – absorb → permute → squeeze architecture  
- **Non-linear operations** – achieved using NFSRs  
- **Fixed-length output** – deterministic and consistent hashing  

---

## 🔐 Algorithm Workflow

1. **Initialization**  
   - Internal state initialized using predefined constants derived from π  

2. **Absorption Phase**  
   - Input data is split into blocks and XORed into the internal state  

3. **Permutation Phase**  
   - NFSRs introduce non-linearity and diffusion across the state  

4. **Squeezing Phase**  
   - Final 160-bit hash value is extracted from the state  

---

## ✨ Features

- Lightweight and efficient hashing  
- Strong avalanche effect  
- Fixed **160-bit hash output**  
- Suitable for embedded and IoT environments  
- Interactive web-based hash generator  
- Educational and research-oriented design  

---

## 🔢 Security Properties

| Property | Description |
|--------|------------|
| Collision Resistance | ~80-bit security |
| Output Length | 160 bits |
| Deterministic | Same input → same output |
| Avalanche Effect | Small input change → large output change |

> ⚠️ **Note:**  
> Hash-One is a research and educational implementation and is **not intended to replace standardized cryptographic hash functions** like SHA-256 in production systems.

---

## 🖥️ Live Demonstration

The project includes a browser-based interface where users can:

- Enter text or data  
- Generate a cryptographic hash  
- Observe changes in hash output for small input modifications  

🔗 **Try it here:**  
https://deepak2004rps.github.io/hash-one.io/

---

## 🛠️ Technologies Used

- HTML5  
- CSS3  
- JavaScript  
- GitHub Pages  

---

## 📂 Project Structure

```text
hash-one/
│
├── index.html        # Main UI
├── style.css         # Styling
├── script.js         # Hash logic implementation
├── assets/           # Images and static files
└── README.md         # Project documentation
