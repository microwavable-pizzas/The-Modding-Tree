function updateDecayBuyables() {
    for (let b of Object.values(tmp.d.buyables)) if (b.requires === player.d.stable.join("")) {
        player.d.bunlocked[b.id] = true
        return
    }
}

addLayer("d", {
    name: "decay",
    startData() {return {
        unlocked: true,
        points: decimalZero,
        timer: {
            11: 0,
            12: 0,
            13: 0
        },
        stable: ["I", "I", "I"],
        bunlocked: {
            11: false,
            21: false,
            22: false,
            23: false,
            31: false,
            32: false,
            33: false
        },
        complexity: 1,
        stored: decimalZero
    }},
    color: "#999E7A",
    row: 0,
    resource: "decaying points",
    hotkeys: [
        {
            key: "d",
            description: "d: reset for decaying points",
            onPress() {if (player.d.unlocked) doReset("d")}
        },
        {
            key: "s",
            description: "s: reset for stored decaying points",
            unlocked() {return hasUpgrade("d", 32)},
            onPress() {if (player.d.points.gte(1e5)) clickClickable("d", 21)}
        }
    ],
    type: "normal",
    baseResource: "points",
    baseAmount() {return player.points},
    requires: 10,
    exponent: 0.5,
    gainMult() {
        let m = decimalOne
        if (hasUpgrade("d", 13)) m = m.mul(upgradeEffect("d", 13).mul)
        if (hasUpgrade("d", 31)) m = m.mul(buyableEffect("d", 21))
        return m
    },
    gainExp() {
        let e = decimalOne
        return e
    },
    passiveGeneration() {
        let p = 0
        if (hasUpgrade("d", 12)) p = upgradeEffect("d", 12).pgn
        return p
    },
    autoPrestige() {return getClickableState("d", 13) === "Cooldown"},
    // decayDecayRate
    decayRate() {
        let d = 0.1
        if (getClickableState("d", 11) === "Active") d = 0
        return d
    },
    pointDecayRate() {
        let d = 0.05
        if (getClickableState("d", 12) === "Active") d = 0
        return d
    },
    storedEffect() {return player.d.stored.mul(99).add(1).sqrt()},
    storedNextAt() {return clickableEffect("d", 21).add(1).sqr().sqr().times(1e5)},
    prestigeButtonText() {return player.nerd
        ? `Gain: ((x/10)^0.5*${format(tmp.d.gainMult)})^${format(tmp.d.gainExp)}<br><br>Decay Rate: ${format(tmp.d.decayRate * 100)}%/s`
        : `Reset for <b>${format(tmp.d.resetGain)}</b> decaying points<br><br>Next at ${format(tmp.d.nextAtDisp)} points`},
    update(d) {
        player.d.points = player.d.points.mul((1-tmp.d.decayRate)**d)

        for (let i = 11; i <= 13; i++) {
            if (getClickableState("d", i) === "Active" || getClickableState("d", i) === "Cooldown") player.d.timer[i] -= d
            if (player.d.timer[i] <= 0) {
                if (getClickableState("d", i) === "Active") {
                    setClickableState("d", i, "Cooldown")
                    player.d.stable[i-11] = "C"
                    if (hasUpgrade("d", 31)) updateDecayBuyables()
                    player.d.timer[i] = 10
                }
                else if (getClickableState("d", i) === "Cooldown") {
                    setClickableState("d", i, "Inactive")
                    player.d.stable[i-11] = "I"
                    if (hasUpgrade("d", 31)) updateDecayBuyables()
                    player.d.timer[i] = 0
                }
            }
        }
        if (getClickableState("d", 11) === "Cooldown") player.d.points = player.d.points.sub(clickableEffect("d", 11) * d).max(0)
    },
    upgrades: {
        11: {
            fullDisplay() {return "<h3>Decay</h3><br>"
            + (player.nerd ? `Effect: x^${format(upgradeEffect("d", 11).exp, 3)}+1`
            : `Decaying points boost points.<br>
            Currently: ${format(upgradeEffect("d", 11).mul)}x<br><br>
            Cost: 0.5 decaying points`)},
            effect() {
                let exp = new Decimal(0.5)
                if (hasUpgrade("d", 31)) exp = exp.add(buyableEffect("d", 31))
                let mul = player.d.points.pow(exp).add(1)
                return {exp: exp, mul: mul}
            },
            canAfford() {return player.d.points.gte(0.5)},
            pay() {player.d.points = player.d.points.sub(0.5)}
        },
        12: {
            fullDisplay() {return "<h3>Decay^2</h3><br>"
            + (player.nerd ? `Decay Rate: ${format(upgradeEffect("d", 12).dcy * 100)}%/s`
            : `Gain 100% of decaying points per second. This decays over time, but is reset on decay reset.<br>
            Currently: ${format(upgradeEffect("d", 12).pgn * 100)}%<br><br>
            Cost: 2 decaying points`)},
            effect() {
                let dcy = 0.1
                if (getClickableState("d", 13) === "Active") dcy = 0
                let pgn = new Decimal((1-dcy) ** player.d.resetTime)
                if (hasUpgrade("d", 31)) pgn = pgn.mul(buyableEffect("d", 23))
                return {dcy: dcy, pgn: pgn}
            },
            unlocked() {return hasUpgrade("d", 11)},
            canAfford() {return player.d.points.gte(2)},
            pay() {player.d.points = player.d.points.sub(2)}
        },
        13: {
            fullDisplay() {return "<h3>Decay^3</h3><br>"
            + (player.nerd ? `Effect: x^${format(upgradeEffect("d", 13).exp, 3)}`
            : `Points boost decaying points, but points now decay.<br>
            Currently: ${format(upgradeEffect("d", 13).mul)}x<br><br>
            Cost: 4 decaying points`)},
            effect() {
                let exp = new Decimal(0.25)
                if (hasUpgrade("d", 31)) exp = exp.add(buyableEffect("d", 32))
                let mul = player.points.pow(exp)
                return {exp: exp, mul: mul}
            },
            unlocked() {return hasUpgrade("d", 12)},
            canAfford() {return player.d.points.gte(4)},
            pay() {player.d.points = player.d.points.sub(4)}
        },
        21: {
            fullDisplay() {return `<h3>Stabilize</h3><br>
            Unlock the decay stabilizer.<br>
            Cost: 16 decaying points`},
            unlocked() {return hasUpgrade("d", 13)},
            canAfford() {return player.d.points.gte(16)},
            pay() {
                player.d.points = player.d.points.sub(16)
                setClickableState("d", 11, "Inactive")
            }
        },
        22: {
            fullDisplay() {return `<h3>Stabilize^2</h3><br>
            Unlock the point stabilizer.<br>
            Cost: 32 decaying points`},
            unlocked() {return hasUpgrade("d", 21)},
            canAfford() {return player.d.points.gte(32)},
            pay() {
                player.d.points = player.d.points.sub(32)
                setClickableState("d", 12, "Inactive")
            }
        },
        23: {
            fullDisplay() {return `<h3>Stabilize^3</h3><br>
            Unlock the decay gain stabilizer.<br>
            Cost: 100 points`},
            unlocked() {return hasUpgrade("d", 22)},
            canAfford() {return player.points.gte(100)},
            pay() {
                player.points = player.points.sub(100)
                setClickableState("d", 13, "Inactive")
            }
        },
        31: {
            fullDisplay() {return `<h3>Purchase</h3><br>
            Unlock buyables.<br>
            Cost: 64 decaying points`},
            unlocked() {return hasUpgrade("d", 23)},
            canAfford() {return player.d.points.gte(64)},
            pay() {
                player.d.points = player.d.points.sub(64)
                updateDecayBuyables()
            }
        },
        32: {
            fullDisplay() {return `<h3>Store</h3><br>
            Unlock storage.<br>
            Cost: 100,000 points`},
            unlocked() {return hasUpgrade("d", 31)},
            canAfford() {return player.points.gte(1e5)},
            pay() {player.points = player.points.sub(1e5)}
        },
        33: {
            fullDisplay() {return `<h3>Eternity?</h3><br>
            Unlock eternal points (next update).<br>
            Cost: 100 stored decaying points`},
            unlocked() {return hasUpgrade("d", 32)},
            canAfford() {return player.d.stored.gte(100)},
            pay() {player.d.stored = player.d.stored.sub(100)}
        }
    },
    clickables: {
        11: {
            title: "Decay Stabilizer",
            display() {return `Stabilize decaying points, preventing their decay for 10s.<br>
            Afterwards, there is a 10s cooldown, during which the stabilizer drains ${format(clickableEffect("d", 11))} decaying points per second.<br><br>
            Currently: ${getClickableState("d", 11)}`},
            effect() {
                let drn = decimalOne
                if (hasUpgrade("d", 32)) drn = drn.mul(tmp.d.storedEffect.cube())
                if (hasUpgrade("d", 31)) drn = drn.pow(buyableEffect("d", 33))
                return drn
            },
            unlocked() {return hasUpgrade("d", 21)},
            canClick() {return getClickableState("d", 11) === "Inactive" && getClickableState("d", 12) !== "Active" && getClickableState("d", 13) !== "Active"},
            onClick() {
                setClickableState("d", 11, "Active")
                player.d.stable[0] = "A"
                if (hasUpgrade("d", 31)) updateDecayBuyables()
                player.d.timer[11] = 10
            },
            style: {"height": "150px", "width": "200px", "border-radius": "10px"}
        },
        12: {
            title: "Point Stabilizer",
            display() {return `Stabilize points, preventing their decay for 10s.<br>
            Afterwards, there is a 10s cooldown, during which the stabilizer drains ${format(clickableEffect("d", 12))} points per second.<br><br>
            Currently: ${getClickableState("d", 12)}`},
            effect() {
                let drn = decimalOne
                if (hasUpgrade("d", 32)) drn = drn.mul(tmp.d.storedEffect.cube())
                if (hasUpgrade("d", 31)) drn = drn.pow(buyableEffect("d", 33))
                return drn
            },
            unlocked() {return hasUpgrade("d", 22)},
            canClick() {return getClickableState("d", 12) === "Inactive" && getClickableState("d", 11) !== "Active" && getClickableState("d", 13) !== "Active"},
            onClick() {
                setClickableState("d", 12, "Active")
                player.d.stable[1] = "A"
                if (hasUpgrade("d", 31)) updateDecayBuyables()
                player.d.timer[12] = 10
            },
            style: {"height": "150px", "width": "200px", "border-radius": "10px"}
        },
        13: {
            title: "Decay Gain Stabilizer",
            display() {return `Stabilize decaying point passive gain, preventing its decay for 10s.<br>
            Afterwards, there is a 10s cooldown, during which the stabilizer auto-resets for decaying points.<br><br>
            Currently: ${getClickableState("d", 13)}`},
            unlocked() {return hasUpgrade("d", 23)},
            canClick() {return getClickableState("d", 13) === "Inactive" && getClickableState("d", 11) !== "Active" && getClickableState("d", 12) !== "Active"},
            onClick() {
                setClickableState("d", 13, "Active")
                player.d.stable[2] = "A"
                if (hasUpgrade("d", 31)) updateDecayBuyables()
                player.d.timer[13] = 10
            },
            style: {"height": "150px", "width": "200px", "border-radius": "10px"}
        },
        21: {
            display() {return player.nerd ? "Gain: (x/100,000)^0.25" : 
            `Reset your decaying points for <b>${formatWhole(clickableEffect("d", 21))}</b> stored decaying points<br><br>Next at ${format(tmp.d.storedNextAt)} decaying points`},
            effect() {return player.d.points.div(1e5).sqrt().sqrt().floor()},
            unlocked() {return hasUpgrade("d", 32)},
            canClick() {return player.d.points.gte(1e5)},
            onClick() {
                player.d.stored = player.d.stored.add(clickableEffect("d", 21))
                doReset("d")
                player.d.points = decimalZero
            },
            style: {"height": "120px", "width": "180px", "border-radius": "25%", "border": "4px solid", "border-color": "rgba(0, 0, 0, 0.125)", "font-size": "14px"}
        }
    },
    bars: {
        11: {
            direction: RIGHT,
            width: 200,
            height: 50,
            display() {return `${getClickableState("d", 11)}: ${formatTime(player.d.timer[11])}`},
            progress() {
                if (getClickableState("d", 11) === "Inactive") return 1
                if (getClickableState("d", 11) === "Active") return player.d.timer[11] / 10
                return 1 - player.d.timer[11] / 10
            },
            unlocked() {return hasUpgrade("d", 21)},
            fillStyle() {return getClickableState("d", 11) === "Cooldown" ? {"background-color": "#15678A"} : {"background-color": "#48DC13"}}
        },
        12: {
            direction: RIGHT,
            width: 200,
            height: 50,
            display() {return `${getClickableState("d", 12)}: ${formatTime(player.d.timer[12])}`},
            progress() {
                if (getClickableState("d", 12) === "Inactive") return 1
                if (getClickableState("d", 12) === "Active") return player.d.timer[12] / 10
                return 1 - player.d.timer[12] / 10
            },
            unlocked() {return hasUpgrade("d", 22)},
            fillStyle() {return getClickableState("d", 12) === "Cooldown" ? {"background-color": "#15678A"} : {"background-color": "#48DC13"}}
        },
        13: {
            direction: RIGHT,
            width: 200,
            height: 50,
            display() {return `${getClickableState("d", 13)}: ${formatTime(player.d.timer[13])}`},
            progress() {
                if (getClickableState("d", 13) === "Inactive") return 1
                if (getClickableState("d", 13) === "Active") return player.d.timer[13] / 10
                return 1 - player.d.timer[13] / 10
            },
            unlocked() {return hasUpgrade("d", 23)},
            fillStyle() {return getClickableState("d", 13) === "Cooldown" ? {"background-color": "#15678A"} : {"background-color": "#48DC13"}}
        }
    },
    buyables: {
        11: {
            title: "Meta-Stabilize",
            display() {return player.nerd ? "Effect: (I+1)^(x^0.5)<br>Cost: 10^x"
            : `Multiply point gain based on the number of inactive stabilizers.<br>
            Requires: I I I<br>
            Cost: ${format(buyableCost("d", 11))} points
            Amount: ${format(getBuyableAmount("d", 11))}<br>
            Effect: ${format(buyableEffect("d", 11))}x`},
            cost() {return new Decimal(10).pow(getBuyableAmount("d", 11))},
            effect() {
                let i = 1
                for (let s of player.d.stable) if (s === "I") i++
                return new Decimal(i).pow(getBuyableAmount("d", 11).sqrt())
            },
            requires: "III",
            unlocked() {return player.d.bunlocked[11]},
            canAfford() {return player.points.gte(buyableCost("d", 11)) && player.d.stable.join("") === "III"},
            buy() {
                player.points = player.points.sub(buyableCost("d", 11))
                addBuyables("d", 11, 1)
            }
        },
        21: {
            title: "Decay Gain",
            display() {return player.nerd ? "Effect: 1.5^(x^0.75)<br>Cost: 4^x"
            : `Multiply decaying point gain.<br>
            Requires: A I I<br>
            Cost: ${format(buyableCost("d", 21))} decaying points
            Amount: ${format(getBuyableAmount("d", 21))}<br>
            Effect: ${format(buyableEffect("d", 21))}x`},
            cost() {return new Decimal(4).pow(getBuyableAmount("d", 21))},
            effect() {return new Decimal(1.5).pow(getBuyableAmount("d", 21).pow(0.75))},
            requires: "AII",
            unlocked() {return player.d.bunlocked[21]},
            canAfford() {return player.d.points.gte(buyableCost("d", 21)) && player.d.stable.join("") === "AII"},
            buy() {
                player.d.points = player.d.points.sub(buyableCost("d", 21))
                addBuyables("d", 21, 1)
            }
        },
        22: {
            title: "Point Gain",
            display() {return player.nerd ? "Effect: 1.3^(x^0.75)<br>Cost: 5^x"
            : `Multiply point gain.<br>
            Requires: I A I<br>
            Cost: ${format(buyableCost("d", 22))} decaying points
            Amount: ${format(getBuyableAmount("d", 22))}<br>
            Effect: ${format(buyableEffect("d", 22))}x`},
            cost() {return new Decimal(5).pow(getBuyableAmount("d", 22))},
            effect() {return new Decimal(1.3).pow(getBuyableAmount("d", 22).pow(0.75))},
            requires: "IAI",
            unlocked() {return player.d.bunlocked[22]},
            canAfford() {return player.d.points.gte(buyableCost("d", 22)) && player.d.stable.join("") === "IAI"},
            buy() {
                player.d.points = player.d.points.sub(buyableCost("d", 22))
                addBuyables("d", 22, 1)
            }
        },
        23: {
            title: "Passive Gain",
            display() {return player.nerd ? "Effect: 1.1^(x^0.75)<br>Cost: 6^x"
            : `Multiply decaying point passive gain.<br>
            Requires: I I A<br>
            Cost: ${format(buyableCost("d", 23))} decaying points
            Amount: ${format(getBuyableAmount("d", 23))}<br>
            Effect: ${format(buyableEffect("d", 23))}x`},
            cost() {return new Decimal(6).pow(getBuyableAmount("d", 23))},
            effect() {return new Decimal(1.1).pow(getBuyableAmount("d", 23).pow(0.75))},
            requires: "IIA",
            unlocked() {return player.d.bunlocked[23]},
            canAfford() {return player.d.points.gte(buyableCost("d", 23)) && player.d.stable.join("") === "IIA"},
            buy() {
                player.d.points = player.d.points.sub(buyableCost("d", 23))
                addBuyables("d", 23, 1)
            }
        },
        31: {
            title: "Decay Exponent",
            display() {return player.nerd ? "Effect: 0.1 - 0.1/(1+x*0.1)<br>Cost: 100^x"
            : `Add to the exponent of <b>Decay</b>.<br>
            Requires: C I I<br>
            Cost: ${format(buyableCost("d", 31))} stored decaying points
            Amount: ${format(getBuyableAmount("d", 31))}<br>
            Effect: +${format(buyableEffect("d", 31))}`},
            cost() {return new Decimal(100).pow(getBuyableAmount("d", 31))},
            effect() {return new Decimal(0.1).sub(new Decimal(0.1).div(getBuyableAmount("d", 31).div(10).add(1)))},
            requires: "CII",
            unlocked() {return player.d.bunlocked[31]},
            canAfford() {return player.d.stored.gte(buyableCost("d", 31)) && player.d.stable.join("") === "CII"},
            buy() {
                player.d.stored = player.d.stored.sub(buyableCost("d", 31))
                addBuyables("d", 31, 1)
            }
        },
        32: {
            title: "Point Exponent",
            display() {return player.nerd ? "Effect: 0.1 - 0.1/(1+x*0.05)<br>Cost: 100^x"
            : `Add to the exponent of <b>Decay^3</b>.<br>
            Requires: I C I<br>
            Cost: ${format(buyableCost("d", 32))} stored decaying points
            Amount: ${format(getBuyableAmount("d", 32))}<br>
            Effect: +${format(buyableEffect("d", 32))}`},
            cost() {return new Decimal(100).pow(getBuyableAmount("d", 32))},
            effect() {return new Decimal(0.1).sub(new Decimal(0.1).div(getBuyableAmount("d", 32).div(20).add(1)))},
            requires: "ICI",
            unlocked() {return player.d.bunlocked[32]},
            canAfford() {return player.d.stored.gte(buyableCost("d", 32)) && player.d.stable.join("") === "ICI"},
            buy() {
                player.d.stored = player.d.stored.sub(buyableCost("d", 32))
                addBuyables("d", 32, 1)
            }
        },
        33: {
            title: "Drain Reduction",
            display() {return player.nerd ? "Effect: 0.9^x<br>Cost: 100^x"
            : `Reduce stabilizer drain.<br>
            Requires: I I C<br>
            Cost: ${format(buyableCost("d", 33))} stored decaying points
            Amount: ${format(getBuyableAmount("d", 33))}<br>
            Effect: ^${format(buyableEffect("d", 33))}`},
            cost() {return new Decimal(100).pow(getBuyableAmount("d", 33))},
            effect() {return new Decimal(0.9).pow(getBuyableAmount("d", 33))},
            requires: "IIC",
            unlocked() {return player.d.bunlocked[33]},
            canAfford() {return player.d.stored.gte(buyableCost("d", 33)) && player.d.stable.join("") === "IIC"},
            buy() {
                player.d.stored = player.d.stored.sub(buyableCost("d", 33))
                addBuyables("d", 33, 1)
            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                ["display-text", () => {return `You have ${colorText(format(player.d.points), "#999E7A")} decaying points`}],
                "blank",
                ["display-text", () => {if (hasUpgrade("d", 32)) return `You have ${colorText(format(player.d.stored), "#999E7A")} stored decaying points, which are multiplying point gain by ${colorText(format(tmp.d.storedEffect), "#999E7A")} and stabilizer drain by ${colorText(format(tmp.d.storedEffect.cube()), "#999E7A")} ${player.nerd ? "((99*x+1)^0.5, (99*x+1)^1.5)" : ""}`}],
                "blank",
                ["row", ["prestige-button", "blank", ["clickable", 21]]],
                "resource-display",
                "upgrades"
            ]
        },
        "Stabilizers": {
            content: [
                ["display-text", () => {if (hasUpgrade("d", 22)) return "Only one stabilizer can be used at a time"}],
                "blank",
                ["row", [["bar", 11], "blank", ["bar", 12], "blank", ["bar", 13]]],
                ["row", [["clickable", 11], "blank", ["clickable", 12], "blank", ["clickable", 13]]]
            ],
            unlocked() {return hasUpgrade("d", 21)}
        },
        "Buyables": {
            content: [
                ["display-text", () => {return `You have ${colorText(format(player.d.points), "#999E7A")} decaying points`}],
                "blank",
                ["display-text", () => {if (hasUpgrade("d", 32)) return `You have ${colorText(format(player.d.stored), "#999E7A")} stored decaying points`}],
                "blank",
                ["display-text", "Buyables unlock based on which stabilizers are active, on cooldown, or inactive"],
                "blank",
                ["display-text", () => {return `Currently: ${player.d.stable.join(" ")}`}],
                "blank",
                ["display-text", () => {return `Only buyables with a maximum of ${player.d.complexity} non-inactive stabilizer can be unlocked (Complexity Tier ${player.d.complexity})`}],
                "blank",
                "buyables"
            ],
            unlocked() {return hasUpgrade("d", 31)}
        }
    }
})