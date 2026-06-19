const WORKOUT_PLAN = {
    monday: {
        id: 'monday',
        name: 'Mon',
        fullName: 'Monday',
        focus: 'Chest + Triceps',
        exercises: [
            { name: 'Flat barbell/machine bench press', sets: 3, reps: '10-12 reps' },
            { name: 'Incline dumbbell press', sets: 3, reps: '10-12 reps' },
            { name: 'Chest fly (machine or cable)', sets: 3, reps: '12-15 reps' },
            { name: 'Triceps pushdown (cable)', sets: 3, reps: '12-15 reps' },
            { name: 'Overhead triceps extension (dumbbell)', sets: 3, reps: '12-15 reps' }
        ]
    },
    tuesday: {
        id: 'tuesday',
        name: 'Tue',
        fullName: 'Tuesday',
        focus: 'Back + Biceps',
        exercises: [
            { name: 'Lat pulldown', sets: 3, reps: '10-12 reps' },
            { name: 'Seated cable row', sets: 3, reps: '10-12 reps' },
            { name: 'Assisted pull-up or back extension machine', sets: 3, reps: '8-10 reps' },
            { name: 'Barbell or dumbbell bicep curl', sets: 3, reps: '12-15 reps' },
            { name: 'Hammer curl', sets: 3, reps: '12-15 reps' }
        ]
    },
    wednesday: {
        id: 'wednesday',
        name: 'Wed',
        fullName: 'Wednesday',
        focus: 'Legs',
        exercises: [
            { name: 'Leg press', sets: 3, reps: '12-15 reps' },
            { name: 'Smith machine or bodyweight squat', sets: 3, reps: '10-12 reps' },
            { name: 'Leg extension', sets: 3, reps: '12-15 reps' },
            { name: 'Leg curl (hamstring)', sets: 3, reps: '12-15 reps' },
            { name: 'Standing calf raise', sets: 3, reps: '15-20 reps' }
        ]
    },
    thursday: {
        id: 'thursday',
        name: 'Thu',
        fullName: 'Thursday',
        focus: 'Shoulders + Abs',
        exercises: [
            { name: 'Machine or dumbbell shoulder press', sets: 3, reps: '10-12 reps' },
            { name: 'Lateral raise', sets: 3, reps: '12-15 reps' },
            { name: 'Front raise', sets: 3, reps: '12-15 reps' },
            { name: 'Plank', sets: 3, reps: '30-45 sec' },
            { name: 'Hanging knee raise or crunch machine', sets: 3, reps: '15 reps' }
        ]
    },
    friday: {
        id: 'friday',
        name: 'Fri',
        fullName: 'Friday',
        focus: 'Back + Biceps',
        exercises: [
            { name: 'Seated row (wide grip)', sets: 3, reps: '10-12 reps' },
            { name: 'Single-arm lat pulldown or row', sets: 3, reps: '10-12 reps' },
            { name: 'Face pull', sets: 3, reps: '12-15 reps' },
            { name: 'Concentration curl', sets: 3, reps: '12-15 reps' },
            { name: 'Cable curl', sets: 3, reps: '12-15 reps' }
        ]
    },
    saturday: {
        id: 'saturday',
        name: 'Sat',
        fullName: 'Saturday',
        focus: 'Legs + Abs',
        exercises: [
            { name: 'Walking lunges', sets: 3, reps: '12 reps per leg' },
            { name: 'Hip thrust or glute bridge machine', sets: 3, reps: '12-15 reps' },
            { name: 'Leg extension', sets: 3, reps: '12-15 reps' },
            { name: 'Seated calf raise', sets: 3, reps: '15-20 reps' },
            { name: 'Cable woodchop or Russian twist', sets: 3, reps: '15 reps per side' }
        ]
    },
    sunday: {
        id: 'sunday',
        name: 'Sun',
        fullName: 'Sunday',
        focus: 'Full rest',
        exercises: []
    }
};

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// State
let currentDayId = '';
let todayId = '';

// DOM Elements
const dayNav = document.getElementById('day-nav');
const workoutContainer = document.getElementById('workout-container');
const progressIndicator = document.getElementById('progress-indicator');
const weeklyTracker = document.getElementById('weekly-tracker');
const celebrationContainer = document.getElementById('celebration-container');

// Initialization
function init() {
    checkWeeklyReset();
    determineToday();
    currentDayId = todayId;
    
    renderWeeklyDots();
    renderDayTabs();
    renderDayView(currentDayId);
    
    registerServiceWorker();
}

function checkWeeklyReset() {
    const lastResetStr = localStorage.getItem('lastResetDate');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find the most recent Sunday
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - dayOfWeek);
    
    const lastSundayTime = lastSunday.getTime();

    if (!lastResetStr || parseInt(lastResetStr, 10) < lastSundayTime) {
        DAY_ORDER.forEach(day => localStorage.removeItem(`progress_${day}`));
        localStorage.setItem('lastResetDate', lastSundayTime.toString());
    }
}

function determineToday() {
    const jsDay = new Date().getDay(); // 0 = Sunday, 1 = Monday
    const index = jsDay === 0 ? 6 : jsDay - 1;
    todayId = DAY_ORDER[index];
}

function getProgress(dayId) {
    const saved = localStorage.getItem(`progress_${dayId}`);
    return saved ? JSON.parse(saved) : {};
}

function saveProgress(dayId, progress) {
    localStorage.setItem(`progress_${dayId}`, JSON.stringify(progress));
}

function updateWeeklyDots() {
    weeklyTracker.innerHTML = '';
    DAY_ORDER.forEach(dayId => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        
        const dayData = WORKOUT_PLAN[dayId];
        if (dayData.exercises.length > 0) {
            const totalSets = dayData.exercises.reduce((acc, ex) => acc + ex.sets, 0);
            const progress = getProgress(dayId);
            const completedSets = Object.values(progress).filter(v => v).length;
            
            if (totalSets > 0 && completedSets === totalSets) {
                dot.classList.add('completed');
            }
        } else {
            // Sunday rest day always counts as completed conceptually, or just don't light it up?
            // "Show 7 small dots/circles... fills in once that day's workout is 100% complete"
            // For Sunday, there's no workout, we can keep it filled if it's past, or keep it empty.
            // Let's mark it complete always since it's a rest day.
            dot.classList.add('completed');
        }
        
        weeklyTracker.appendChild(dot);
    });
}

function renderWeeklyDots() {
    updateWeeklyDots();
}

function renderDayTabs() {
    dayNav.innerHTML = '';
    DAY_ORDER.forEach(dayId => {
        const tab = document.createElement('button');
        tab.className = `day-tab ${dayId === currentDayId ? 'active' : ''}`;
        tab.textContent = WORKOUT_PLAN[dayId].name;
        tab.onclick = () => {
            currentDayId = dayId;
            document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderDayView(dayId);
            
            // Scroll to center the active tab if on mobile
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        };
        dayNav.appendChild(tab);
    });
    
    // Initial scroll to active tab
    setTimeout(() => {
        const activeTab = document.querySelector('.day-tab.active');
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
        }
    }, 0);
}

function renderDayView(dayId) {
    const dayData = WORKOUT_PLAN[dayId];
    workoutContainer.innerHTML = '';
    
    if (dayData.exercises.length === 0) {
        progressIndicator.textContent = '';
        workoutContainer.innerHTML = `
            <div class="rest-day-message">
                <h2>Rest Day</h2>
                <p>Recover and recharge.</p>
            </div>
        `;
        return;
    }

    const progress = getProgress(dayId);
    let totalSets = 0;
    let completedSets = 0;

    dayData.exercises.forEach((ex, exIndex) => {
        totalSets += ex.sets;
        
        const card = document.createElement('div');
        card.className = 'exercise-card';
        
        const header = document.createElement('div');
        header.className = 'exercise-header';
        
        const titleArea = document.createElement('div');
        titleArea.className = 'exercise-title-area';
        titleArea.innerHTML = `
            <div class="exercise-title">${ex.name}</div>
            <div class="exercise-scheme">${ex.sets} sets x ${ex.reps}</div>
        `;
        
        const actionsArea = document.createElement('div');
        actionsArea.className = 'exercise-actions';
        
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise form')}`;
        const ytBtn = document.createElement('button');
        ytBtn.className = 'youtube-btn';
        ytBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M9.996,15.005l0.005-6l5.207,3.005L9.996,15.005z"/>
            </svg>
        `;
        ytBtn.onclick = (e) => {
            e.stopPropagation();
            window.open(ytUrl, '_blank');
        };
        
        const expandIcon = document.createElement('div');
        expandIcon.className = 'expand-icon';
        expandIcon.innerHTML = '▼';
        
        actionsArea.appendChild(ytBtn);
        actionsArea.appendChild(expandIcon);
        
        header.appendChild(titleArea);
        header.appendChild(actionsArea);
        card.appendChild(header);
        
        const setsContainer = document.createElement('div');
        setsContainer.className = 'sets-container';
        
        let exCompletedSets = 0;
        const setElements = [];
        
        for (let s = 1; s <= ex.sets; s++) {
            const setKey = `${exIndex}_${s}`;
            const isChecked = progress[setKey] || false;
            if (isChecked) {
                completedSets++;
                exCompletedSets++;
            }
            
            const setRow = document.createElement('div');
            setRow.className = 'set-row';
            
            const setLabel = document.createElement('div');
            setLabel.className = 'set-label';
            setLabel.textContent = `Set ${s}`;
            
            const checkbox = document.createElement('div');
            checkbox.className = `set-checkbox ${isChecked ? 'checked' : ''}`;
            
            setRow.appendChild(setLabel);
            setRow.appendChild(checkbox);
            
            setElements.push(checkbox);
            
            setRow.onclick = (e) => {
                e.stopPropagation();
                const currentlyChecked = checkbox.classList.contains('checked');
                
                // Track before change
                const wasAllComplete = (completedSets === totalSets);
                
                if (currentlyChecked) {
                    checkbox.classList.remove('checked');
                    progress[setKey] = false;
                    completedSets--;
                    exCompletedSets--;
                } else {
                    checkbox.classList.add('checked');
                    progress[setKey] = true;
                    completedSets++;
                    exCompletedSets++;
                }
                
                // Update exercise strikethrough state
                if (exCompletedSets === ex.sets) {
                    card.classList.add('exercise-completed');
                } else {
                    card.classList.remove('exercise-completed');
                }
                
                saveProgress(dayId, progress);
                updateProgressIndicator(completedSets, totalSets);
                updateWeeklyDots();
                
                // Trigger celebration if just hit 100% for the day (allow on any day)
                if (!wasAllComplete && completedSets === totalSets && totalSets > 0) {
                    triggerCelebration();
                }
            };
            
            setsContainer.appendChild(setRow);
        }
        
        // Initial strikethrough state
        if (exCompletedSets === ex.sets) {
            card.classList.add('exercise-completed');
        }
        
        header.onclick = () => {
            card.classList.toggle('expanded');
        };
        
        card.appendChild(setsContainer);
        workoutContainer.appendChild(card);
    });

    updateProgressIndicator(completedSets, totalSets);
}

function updateProgressIndicator(completed, total) {
    progressIndicator.textContent = `${completed}/${total} sets done`;
}

function triggerCelebration() {
    celebrationContainer.classList.remove('hidden');
    setTimeout(() => {
        celebrationContainer.classList.add('hidden');
    }, 2500);
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        });
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
