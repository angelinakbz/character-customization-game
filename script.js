document.addEventListener('DOMContentLoaded', () => {
	const buttons = document.querySelectorAll('.outfit-button');

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			const outfitId = btn.dataset.outfit;
			const group = document.getElementById(outfitId);
			if (!group) return;
			const isHidden = group.classList.toggle('hidden');
			btn.classList.toggle('active', !isHidden);
		});
	});

	const clear = document.getElementById('clear-button');
	if (clear) {
		clear.addEventListener('click', () => {
			document.querySelectorAll('.outfit').forEach(g => g.classList.add('hidden'));
			document.querySelectorAll('.outfit-button').forEach(b => b.classList.remove('active'));
		});
	}

	// enter game button: hide all content except the pink background
	const enter = document.getElementById('enter-game');
	if (enter) {
		enter.classList.add('pulse');
		enter.addEventListener('click', () => {
			document.body.classList.remove('pet');
			document.body.classList.add('blank');
		});
	}

	// Home button to exit game mode
	const home = document.getElementById('home-button');
	if (home) {
		home.addEventListener('click', () => {
			document.body.classList.remove('blank', 'pet');
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}


	/* Character chooser logic */
	const chooser = document.getElementById('character-chooser');
	const charImage = document.getElementById('char-image');
	const charCaption = document.getElementById('char-caption');
	const prevBtn = document.getElementById('prev-char');
	const nextBtn = document.getElementById('next-char');
	const shuffleBtn = document.getElementById('shuffle-char');

	// List of character image filenames (provided)
	const characters = [
		"download (70).jpeg",
		"Helps_Juana on TikTok.jpeg",
		"My little star.jpeg",
		"˚ ༘♡ ⋆｡˚.jpeg",
		"my friend_3 game = My Little Star.jpeg",
		"⬜️🐰✨️.jpeg",
		"Wonyoung 🩷🤍🪽.jpeg",
		"★_(◠‿◕✿).jpeg",
		"Cutesy doll made by me.jpeg",
		"🗯️❔star.jpeg",
		"my litle star.jpeg",
		"download (71).jpeg",
		"download (72).jpeg",
		"download (73).jpeg",
		"download (74).jpeg",
		"download (75).jpeg",
		"download (76).jpeg",
		"download (77).jpeg",
		"download (78).jpeg",
		"download (79).jpeg",
		"download (80).jpeg",
		"стела☀️☀️.jpeg",
		"Zenin Maki.jpeg",
	];

	let charOrder = characters.slice();
	let index = 0;

	function showCharacter(i) {
		if (!charImage) return;
		index = (i + charOrder.length) % charOrder.length;
		charImage.src = encodeURIComponent(charOrder[index]);
		charImage.alt = `character ${index+1}`;
		charCaption.textContent = `${index+1} / ${charOrder.length}`;
	}

	function shuffleArray(a) {
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
	}

	// If opened with ?choose=1&char=... then open the character chooser and show that character
	(function handleIncomingChooserParams(){
		const initParams = new URLSearchParams(window.location.search);
		if (initParams.get('choose') === '1') {
			document.body.classList.remove('pet');
			document.body.classList.add('blank');
			charOrder = characters.slice();
			const desired = initParams.get('char') || '';
			let idx = charOrder.indexOf(desired);
			if (idx === -1) idx = 0;
			showCharacter(idx);
				// remove query params so a reload doesn't reopen the chooser
				history.replaceState(null, '', window.location.pathname);
		}
	})();

	if (prevBtn) prevBtn.addEventListener('click', () => showCharacter(index - 1));
	if (nextBtn) nextBtn.addEventListener('click', () => showCharacter(index + 1));
	if (shuffleBtn) shuffleBtn.addEventListener('click', () => {
		shuffleArray(charOrder);
		showCharacter(0);
	});

	const selectBtn = document.getElementById('select-char');
	const charStage = document.querySelector('.char-stage');
	let selectedCharacter = null;

	const petScreen = document.getElementById('pet-screen');

	if (selectBtn) {
		selectBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			selectedCharacter = charOrder[index];
			if (charStage) {
				charStage.classList.add('selected');
			}
			if (charCaption) {
				charCaption.textContent = `Selected: ${index+1} / ${charOrder.length}`;
			}
			// store selection on body and in localStorage for later use across pages
			document.body.dataset.selectedCharacter = selectedCharacter;
			try{ localStorage.setItem('selectedCharacter', selectedCharacter); }catch(e){}
			// navigate to dedicated pet page for a full-screen pet chooser
			const url = 'pet.html?char=' + encodeURIComponent(selectedCharacter || '');
			window.location.href = url;
		});
	}

	// initialize image when entering game mode
	if (enter) {
		enter.addEventListener('click', () => {
			charOrder = characters.slice();
			showCharacter(0);
		});
	}

});

