let modInfo = {
	name: "The Decaying Tree",
	id: "tdtmp???",
	author: "microwave pizza",
	pointsName: "points",
	modFiles: ["layers/d.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: decimalZero, // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Decayed",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		+ added first layer`

let winText = `You completed the game!`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints() {return new Decimal(modInfo.initialStartPoints)}

// Determines if it should show points/sec
function canGenPoints() {return true}

// Calculate points/sec!
function getPointGen() {
	let gain = decimalOne
	if (hasUpgrade("d", 11)) gain = gain.mul(upgradeEffect("d", 11).mul)
	if (hasUpgrade("d", 31)) {
		gain = gain.mul(buyableEffect("d", 11))
		gain = gain.mul(buyableEffect("d", 22))
	}
	if (hasUpgrade("d", 32)) gain = gain.mul(tmp.d.storedEffect)

	if (hasUpgrade("d", 13)) gain = gain.sub(player.points.mul(tmp.d.pointDecayRate))
	if (getClickableState("d", 12) === "Cooldown") gain = gain.sub(clickableEffect("d", 12))
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {nerd: false}}

// Display extra things at the top of the page
var displayThings = [
	() => {if (player.nerd && hasUpgrade("d", 13)) return `Decay Rate: ${format(tmp.d.pointDecayRate * 100)}%`},
	"Endgame: The last decay upgrade"
]

// Determines when the game "ends"
function isEndgame() {return false}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {return 0.05} // Default is 1 hour which is just arbitrarily large


// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {}