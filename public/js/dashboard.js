document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/';
        return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const userNameEl = document.getElementById('user-name');
    const userAadharEl = document.getElementById('user-aadhar');
    const voteStatusEl = document.getElementById('vote-status');
    const alertMsg = document.getElementById('alert-message');
    const candidatesGrid = document.getElementById('candidates-grid');
    const loadingEl = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');
    const resultsBody = document.getElementById('results-body');

    let user = null;
    let candidates = [];

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

    const fetchProfile = async () => {
        try {
            const res = await fetch('/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                user = data.user;
                if(user.role === 'admin') {
                    window.location.href = '/admin.html';
                    return;
                }
                
                userNameEl.textContent = user.name;
                userAadharEl.textContent = `Aadhar: ${String(user.aadharCardNumber).slice(0, 4)}********`;
                
                if (user.isVoted) {
                    voteStatusEl.textContent = 'You have voted';
                    voteStatusEl.className = 'badge voted';
                    fetchResults();
                } else {
                    voteStatusEl.textContent = 'Not yet voted';
                    voteStatusEl.className = 'badge';
                }
                
            } else {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
        } catch (err) {
            console.error(err);
            showAlert('Failed to load profile');
        }
    };

    const fetchCandidates = async () => {
        loadingEl.classList.remove('hidden');
        candidatesGrid.classList.add('hidden');
        
        try {
            const res = await fetch('/candidate');
            candidates = await res.json();
            
            loadingEl.classList.add('hidden');
            candidatesGrid.classList.remove('hidden');
            
            renderCandidates();
        } catch (err) {
            console.error(err);
            showAlert('Failed to load candidates');
            loadingEl.textContent = 'Failed to load candidates';
        }
    };

    const renderCandidates = () => {
        candidatesGrid.innerHTML = '';
        
        if (candidates.length === 0) {
            candidatesGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No candidates available yet.</p>';
            return;
        }

        candidates.forEach(candidate => {
            const card = document.createElement('div');
            card.className = 'candidate-card';
            
            card.innerHTML = `
                <div class="candidate-name">${candidate.name}</div>
                <div class="candidate-party">${candidate.party}</div>
                <div class="stats">
                    ${user && !user.isVoted 
                        ? `<button class="btn vote-btn" data-id="${candidate._id}">Vote</button>` 
                        : `<button class="btn btn-secondary" disabled>Vote Recorded</button>`
                    }
                </div>
            `;
            
            candidatesGrid.appendChild(card);
        });

        // Add event listeners to vote buttons
        if (user && !user.isVoted) {
            document.querySelectorAll('.vote-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const candidateId = e.target.getAttribute('data-id');
                    await castVote(candidateId, e.target);
                });
            });
        }
    };

    const castVote = async (candidateId, btnElement) => {
        if (!confirm('Are you sure you want to vote for this candidate? You cannot change this later.')) {
            return;
        }
        
        btnElement.disabled = true;
        btnElement.textContent = 'Voting...';
        
        try {
            const res = await fetch(`/candidate/vote/${candidateId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await res.json();
            
            if (res.ok) {
                showAlert('Vote successfully recorded!', false);
                user.isVoted = true;
                voteStatusEl.textContent = 'You have voted';
                voteStatusEl.className = 'badge voted';
                renderCandidates(); // re-render to disable buttons
                fetchResults(); // show results
            } else {
                showAlert(data.message || data.error || 'Failed to record vote');
                btnElement.disabled = false;
                btnElement.textContent = 'Vote';
            }
        } catch (err) {
            console.error(err);
            showAlert('Network error occurred');
            btnElement.disabled = false;
            btnElement.textContent = 'Vote';
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
        if (user && user.isVoted) {
            fetchResults();
        }
    });

    // Init
    await fetchProfile();
    await fetchCandidates();
});
