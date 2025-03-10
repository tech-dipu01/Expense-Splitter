document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expenseForm');
    const calculateButton = document.getElementById('calculateButton');
    const clearButton = document.getElementById('clearButton');
    const resultDiv = document.getElementById('result');

    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    expenseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const contributed = parseFloat(document.getElementById('contributed').value);
        const expensesMade = parseFloat(document.getElementById('expenses').value);
        const description = document.getElementById('description').value;

        expenses.push({ name, contributed, expensesMade, description });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        alert('Expense added successfully!');
        expenseForm.reset();
    });

    calculateButton.addEventListener('click', function() {
        const result = calculateSettlements(expenses);
        resultDiv.innerHTML = result;
    });

    clearButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all data?')) {
            localStorage.removeItem('expenses');
            expenses = [];
            resultDiv.innerHTML = 'Data has been cleared.';
            alert('Data has been cleared successfully!');
        }
    });

    function calculateSettlements(expenses) {
        const totalExpense = expenses.reduce((sum, expense) => sum + expense.expensesMade, 0);
        const perPersonShare = totalExpense / expenses.length;

        const netContributions = expenses.map(expense => {
            return {
                name: expense.name,
                net: expense.contributed - perPersonShare
            };
        });

        const result = [];
        result.push(`Total Expense: ₹${totalExpense.toFixed(2)}`);
        result.push(`Per Person Share: ₹${perPersonShare.toFixed(2)}`);
        result.push('Settlements:');

        const creditors = netContributions.filter(contribution => contribution.net > 0);
        const debtors = netContributions.filter(contribution => contribution.net < 0);

        while (creditors.length > 0 && debtors.length > 0) {
            const creditor = creditors[0];
            const debtor = debtors[0];

            if (Math.abs(debtor.net) > creditor.net) {
                result.push(`${debtor.name} pays ₹${creditor.net.toFixed(2)} to ${creditor.name}.`);
                debtor.net += creditor.net;
                creditors.shift();
            } else {
                result.push(`${debtor.name} pays ₹${Math.abs(debtor.net).toFixed(2)} to ${creditor.name}.`);
                creditor.net -= Math.abs(debtor.net);
                debtors.shift();
            }
        }

        if (creditors.length === 0 && debtors.length === 0) {
            result.push('No one owes anything. ✅');
        } else {
            creditors.forEach(creditor => {
                if (creditor.net > 0) {
                    result.push(`${creditor.name} gets ₹${creditor.net.toFixed(2)}.`);
                }
            });
            debtors.forEach(debtor => {
                if (debtor.net < 0) {
                    result.push(`${debtor.name} pays ₹${Math.abs(debtor.net).toFixed(2)}.`);
                }
            });
        }

        return result.join('<br>');
    }
}); 