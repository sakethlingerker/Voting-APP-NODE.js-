document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/';
        return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const alertMsg = document.getElementById('alert-message');
    
    const candidateForm = document.getElementById('candidate-form');
    const nameInput = document.getElementById('candidate-name');
    const partyInput = document.getElementById('candidate-party');
    const ageInput = document.getElementById('candidate-age');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const candidateIdInput = document.getElementById('candidate-id');
    
    const candidatesTable = document.getElementById('candidates-table');
    const candidatesBody = document.getElementById('candidates-body');
    const loadingEl = document.getElementById('loading');
    
    const resultsSection = document.getElementById('results-section');
    const resultsBody = document.getElementById('results-body');

    let candidates = [];
    let isEditing = false;

    const showAlert = (message, isError = true) => {
        alertMsg.textContent = message;
        alertMsg.className = `alert show alert-${isError ? 'error' : 'success'}`;
        setTimeout(() => alertMsg.className = 'alert', 5000);
    };

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    });

    const verifyAdminStatus = async () => {
        try {
            const res = await fetch('/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                if(data.user.role !== 'admin') {
                    window.location.href = '/dashboard.html';
                    return;
                }
                document.getElementById('admin-name').textContent = `Logged in as: ${data.user.name}`;
            } else {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
        } catch (err) {
            console.error(err);
            showAlert('Failed to authenticate admin status');
            window.location.href = '/';
        }
    };

    const fetchCandidates = async () => {
        loadingEl.classList.remove('hidden');
        candidatesTable.classList.add('hidden');
        
        try {
            const res = await fetch('/candidate');
            candidates = await res.json();
            
            loadingEl.classList.add('hidden');
            candidatesTable.classList.remove('hidden');
            
            renderCandidates();
        } catch (err) {
            console.error(err);
            showAlert('Failed to load candidates');
            loadingEl.textContent = 'Failed to load candidates';
        }
    };

    const renderCandidates = () => {
        candidatesBody.innerHTML = '';
        
        if (candidates.length === 0) {
            candidatesBody.innerHTML = '<tr><td colspan="3" class="text-center">No candidates found.</td></tr>';
            return;
        }

        candidates.forEach(candidate => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td style="font-weight: 500;">${candidate.name}</td>
                <td><span class="badge">${candidate.party}</span></td>
                <td class="action-btns">
                    <button class="btn btn-secondary btn-small edit-btn" data-id="${candidate._id}">Edit</button>
                    <button class="btn btn-danger btn-small delete-btn" data-id="${candidate._id}">Delete</button>
                </td>
            `;
            
            candidatesBody.appendChild(tr);
        });

        // Add Event Listeners for Edit & Delete
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const candidate = candidates.find(c => c._id === id);
                if (candidate) {
                    editCandidate(candidate);
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this candidate?')) {
                    await deleteCandidate(id);
                }
            });
        });
    };

    const resetForm = () => {
        candidateForm.reset();
        isEditing = false;
        candidateIdInput.value = '';
        formTitle.textContent = 'Add Candidate';
        submitBtn.textContent = 'Add Candidate';
        cancelBtn.classList.add('hidden');
    };

    const editCandidate = (candidate) => {
        isEditing = true;
        candidateIdInput.value = candidate._id;
        nameInput.value = candidate.name;
        partyInput.value = candidate.party;
        // The list API doesnt return age currently. We will just use a default or fetch details.
        ageInput.value = candidate.age || 25; 
        
        formTitle.textContent = 'Edit Candidate';
        submitBtn.textContent = 'Update Candidate';
        cancelBtn.classList.remove('hidden');
        
        // Scroll to form
        candidateForm.scrollIntoView({ behavior: 'smooth' });
    };

    cancelBtn.addEventListener('click', resetForm);

    candidateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            name: nameInput.value,
            party: partyInput.value,
            age: parseInt(ageInput.value)
        };

        submitBtn.disabled = true;
        
        try {
            let res;
            if (isEditing) {
                // Update
                res = await fetch(`/candidate/${candidateIdInput.value}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                // Add
                res = await fetch('/candidate', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();
            
            if (res.ok) {
                showAlert(isEditing ? 'Candidate updated!' : 'Candidate added!', false);
                resetForm();
                fetchCandidates();
                fetchResults();
            } else {
                showAlert(data.error || data.message || 'Operation failed');
            }
        } catch (err) {
            console.error(err);
            showAlert('Network error occurred');
        } finally {
            submitBtn.disabled = false;
        }
    });

    const deleteCandidate = async (id) => {
        try {
            const res = await fetch(`/candidate/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                showAlert('Candidate deleted', false);
                fetchCandidates();
                fetchResults();
            } else {
                const data = await res.json();
                showAlert(data.error || 'Failed to delete candidate');
            }
        } catch (err) {
            console.error(err);
            showAlert('Network error occurred');
        }
    };

    const fetchResults = async () => {
        try {
            const res = await fetch('/candidate/vote/count');
            const data = await res.json();
            
            if (res.ok) {
                resultsSection.classList.remove('hidden');
                resultsBody.innerHTML = '';
                
                data.forEach(result => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="font-weight: 600;">${result.party}</td>
                        <td class="vote-count" style="font-size: 1.2rem;">${result.count}</td>
                    `;
                    resultsBody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error('Failed to fetch results', err);
        }
    };

    refreshBtn.addEventListener('click', () => {
        fetchCandidates();
        fetchResults();
    });

    // Init
    await verifyAdminStatus();
    await fetchCandidates();
    await fetchResults();
});
