let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;

const form = document.getElementById("transactionForm");
const list = document.getElementById("transactionList");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const type = document.getElementById("type").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    const transaction = {
        id: Date.now(),
        type,
        amount,
        category,
        date
    };

    transactions.push(transaction);
    saveToLocalStorage();
    updateUI();

    form.reset();
});

function saveToLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateUI() {
    updateSummary();
    renderTransactions();
    updateChart();
}

function updateSummary() {
    const income = transactions
        .filter(t => t.type === "income")
        .reduce((acc, curr) => acc + curr.amount, 0);

    const expense = transactions
        .filter(t => t.type === "expense")
        .reduce((acc, curr) => acc + curr.amount, 0);

    totalIncomeEl.textContent = "₹" + income;
    totalExpenseEl.textContent = "₹" + expense;
    balanceEl.textContent = "₹" + (income - expense);
}

function renderTransactions() {
    list.innerHTML = "";

    transactions.forEach(t => {
        const li = document.createElement("li");
        li.classList.add("transaction-item");

        li.innerHTML = `
            <span>${t.category} - ₹${t.amount} (${t.date})</span>
            <button class="delete-btn" onclick="deleteTransaction(${t.id})">X</button>
        `;

        list.appendChild(li);
    });
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToLocalStorage();
    updateUI();
}

function updateChart() {
    const expenseData = {};

    transactions.forEach(t => {
        if (t.type === "expense") {
            expenseData[t.category] =
                (expenseData[t.category] || 0) + t.amount;
        }
    });

    const labels = Object.keys(expenseData);
    const data = Object.values(expenseData);

    const ctx = document.getElementById("expenseChart").getContext("2d");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
    '#FFD700',  // Yellow
    '#FF4C4C',  // Red
    '#4DA6FF',  // Light Blue
    '#00C49F',  // Teal
    '#FF8C42',  // Orange
    '#9B5DE5'   // Purple
],
borderColor: '#0f172a',
borderWidth: 2
            }]
        },options: {
    responsive: true,
    maintainAspectRatio: true
}
    });
}

updateUI();
const modal = document.getElementById('monthlyModal');
const btn = document.getElementById('monthlySummaryBtn');
const span = document.querySelector('.close');

btn.onclick = () => modal.style.display = 'block';
span.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };
// --- b) Fill month selector ---
const monthSelect = document.getElementById('monthSelect');
const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

// Add last 12 months
for(let i=0; i<12; i++){
    let monthIndex = (currentMonth - i + 12) % 12;
    let year = currentYear - Math.floor((i + (12-currentMonth-1))/12);
    let option = document.createElement('option');
    option.value = monthIndex + '-' + year;
    option.text = months[monthIndex] + ' ' + year;
    monthSelect.appendChild(option);
}

monthSelect.value = currentMonth + '-' + currentYear; // default to current month
// --- c) Update monthly summary & chart ---
function updateMonthlySummary(){
    const [monthIndex, year] = monthSelect.value.split('-').map(Number);
    const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === monthIndex && d.getFullYear() === year;
    });

    let income = filtered.filter(t=>t.type==='income').reduce((a,b)=>a+b.amount,0);
    let expense = filtered.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0);
    let balance = income - expense;

    document.getElementById('modalTotalIncome').innerText = '₹'+income;
    document.getElementById('modalTotalExpense').innerText = '₹'+expense;
    document.getElementById('modalBalance').innerText = '₹'+balance;

    // Update chart
    const ctx = document.getElementById('modalExpenseChart').getContext('2d');
    const categories = [...new Set(filtered.map(t=>t.category))];
    const amounts = categories.map(cat=>filtered.filter(t=>t.category===cat).reduce((a,b)=>a+b.amount,0));

    if(window.modalChart) window.modalChart.destroy();
    window.modalChart = new Chart(ctx, {
        type: 'pie',
        data: { labels: categories, datasets:[{ data: amounts, backgroundColor:['#FFD700','#FF4C4C','#4DA6FF','#00C49F','#FF8C42'] }] },
        options:{ responsive:true, maintainAspectRatio:true, plugins:{ legend:{ labels:{color:'#e2e8f0'} } } }
    });
}

// Event listener
monthSelect.addEventListener('change', updateMonthlySummary);

// Initialize modal with current month
updateMonthlySummary();