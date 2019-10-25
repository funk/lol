// ==UserScript==
// @name         lol
// @namespace    https://twitter.com/sidney_de_vries
// @version      1.8.0
// @author       axthny x hrt
// @match        *://krunker.io/*
// @run-at       document-start
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant        unsafeWindow
// ==/UserScript==

function randomName() {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var randomized = '';
    for (var i=0;i<16;i++) {
        randomized += characters[Math.floor(Math.random() * Math.floor(characters.length - 1))];
    }
    return randomized;
}

function hack(name, keybind, status) {
  this.name = name;
  this.keybind = keybind;
  this.status = status;
}

let hacks = randomName();

let getHack = randomName();
unsafeWindow[getHack] = function(name) {
    var returned;
    unsafeWindow[hacks].forEach(function(hack){
        if(hack.name === name) returned = hack;
    });
    return returned;
}

unsafeWindow[hacks] = [];
unsafeWindow[hacks].push(new hack("Aimbot", "1", true));
unsafeWindow[hacks].push(new hack("ESP", "2", true));
unsafeWindow[hacks].push(new hack("BHop", "3", true));
unsafeWindow[hacks].push(new hack("AutoReload", "4", true));
unsafeWindow[hacks].push(new hack("GUI", "5", true));

window.addEventListener('keydown', (key) => {
    unsafeWindow[hacks].forEach(function(hack) {
        if(hack.keybind === String.fromCharCode(key.keyCode)) {
            hack.status = !hack.status;
        }
    });
});

var GUI = document.createElement('div');
GUI.style = "float:right;width:100%;background-color: rgba(0,0,0,0.25);border-radius:5%;text-align:center;margin-top:5%;";

function guiReload() {
    GUI.innerHTML = "";
    if(unsafeWindow[getHack]("GUI").status) {
        GUI.innerHTML += "<br><h2 style='color:#A882DC;'>lol</h2><hr>";
        unsafeWindow[hacks].forEach(function(hack) {
            GUI.innerHTML += `<h3><span style='float:left;margin-left:10%;color:#FFBD48'>[${hack.keybind}]</span><span style='margin-left:-10%;color:${hack.status ? "#98EA2F" : "#FF4040"};'>${hack.name}</span></h3>`;
        });
        GUI.innerHTML += "<br>";
    }
}

setInterval(function(){
    let topRight = document.getElementById("topRight");
    if(!topRight) return;

    if(!topRight.contains(GUI)) {
        topRight.appendChild(GUI);
    } else {
        guiReload();
    }
}, 0);

/* Basic Globals */
let inputs = randomName();
let control = randomName();
let myself = randomName();
let players = randomName();

/* Aimbot Globals */
let canShoot = randomName();
let scopedOut = randomName();
let quickscoper = randomName();
let lookAt = randomName();
let camLookAt = randomName();
let distance = randomName();

function patch(script) {
    script = script.replace(/(\!)/,
      `
        var ${inputs};
        var ${control};
        var ${myself};
        var ${players};

        var ${canShoot} = true;
        var ${scopedOut} = false;
        function ${quickscoper}(target) {
            if (${myself}.didShoot) {
                ${canShoot} = false;
                setTimeout(() => {
                    ${canShoot} = true;
                }, ${myself}.weapon.rate / 1.85);
            }
            if (${control}.mouseDownL === 1) {
                ${control}.mouseDownL = 0;
                ${control}.mouseDownR = 0;
                ${scopedOut} = true;
            }
            if (${myself}.aimVal === 1) {
                ${scopedOut} = false;
            }
            if (${scopedOut} || !${canShoot} || ${myself}.recoilForce > 0.01) {
                return false;
            }
            ${lookAt}(target);
            if (${control}.mouseDownR === 0) {
                ${control}.mouseDownR = 1;
            }
            else if (${myself}.aimVal < 0.2) {
                ${control}.mouseDownL = 1 - ${control}.mouseDownL;
            }
            return true;
        }
        function ${lookAt}(target) {
            ${control}.${camLookAt}(target.x2, target.y2 + target.height - 1.5 - 2.5 * target.crouchVal - ${myself}.recoilAnimY * 0.3 * 25, target.z2);
        }
        function ${distance}(p1, p2) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dz = p1.z - p2.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
      $1`
    );
    script = script.replace(/(this\[\'procInputs\'\]=function\((\w+),(\w+),(\w+),(\w+)\)\{)/,
      `$1
        ${inputs} = $2;

        /* Aimbot */
        if(${getHack}("Aimbot").status) {
          if (!${myself} || ${players}.length < 1) {
              return;
          }

          const possibleTargets = ${players}.filter(player => {
              return player.active && player.isSeen && !player.isYou && (!player.team || player.team !== ${myself}.team);
          }).sort((p1, p2) => ${distance}(${myself}, p1) - ${distance}(${myself}, p2));

          let isLockedOn = false;
          if (possibleTargets.length > 0) {
              const target = possibleTargets[0];
              isLockedOn = ${quickscoper}(target);
          }
          if(!isLockedOn) {
            ${control}.${camLookAt}(null);
            ${control}.target = null;
            ${control}.mouseDownL = 0;
            ${control}.mouseDownR = 0;
          }
        }

        /* BHop */
        if(${control}['keys'][${control}['moveKeys'][0]] && ${getHack}("BHop").status) {
          ${control}['keys'][${control}['jumpKey']] = !${control}['keys'][${control}['jumpKey']];
        }

        /* AutoReload */
        if(${myself} && ${myself}.ammos[${myself}.weaponIndex] === 0 && ${getHack}("AutoReload").status) {
          ${inputs}[9] = 1;
        }
      `
    );
    script = script.replace(/(this\[\'update\'\]\=function\(\w+\,\w+\,(\w+)\)\{)/,
      `$1
        ${players} = this.players.list;
        ${myself} = $2;
      `
    );
    script = script.replace(/(this\[\'setCamPosOff\'\]\=)/,
      `
        ${control} = this
      ,$1`
    );
    script = script.replace(/{if\(this\['target']\){([^}]+)}},this\['([a-zA-Z0-9_]+)']=/,  `
      {
        if (this.target) {
            this.yDr = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.target.xD)) % Math.PI2;
            this.xDr = this.target.yD % Math.PI2;
        }
      }, this.${camLookAt} =
    `);
    script = script.replace(/(\w+)\[\'\w+\'\](\(\w+\[\'x\'\]\,\w+\[\'y\'\]\+\w+\[\'height\'\]\/1.5\,\w+\[\'z\'\])/, `$1['${camLookAt}']$2`);
    script = script.replace(/if\(!\w+\['isSeen'\]\)continue;/, `if(!${getHack}("ESP").status)continue;`);

    return script;
}

/* Anticheat Bypass */
var _0x55e8=['\x52\x46\x33\x43\x68\x63\x4f\x54\x46\x67\x3d\x3d','\x42\x41\x2f\x43\x67\x56\x72\x43\x6e\x4d\x4b\x50\x5a\x38\x4b\x42\x41\x67\x3d\x3d','\x50\x6a\x77\x44\x47\x67\x59\x3d','\x57\x32\x62\x43\x6e\x4d\x4f\x6a\x4b\x63\x4b\x79\x77\x34\x6b\x4e\x77\x34\x7a\x44\x70\x63\x4f\x70\x77\x6f\x52\x6c\x77\x70\x46\x52\x77\x37\x30\x39\x57\x4d\x4f\x33\x77\x35\x56\x54\x44\x6d\x46\x63\x4e\x63\x4b\x33\x64\x6d\x54\x43\x6d\x63\x4f\x6d\x77\x37\x6e\x44\x74\x38\x4b\x69\x47\x63\x4b\x51\x77\x71\x58\x43\x6c\x6d\x73\x42\x77\x35\x35\x39\x77\x72\x66\x44\x6c\x6c\x6a\x43\x75\x77\x38\x7a\x77\x35\x54\x44\x6b\x32\x63\x53\x77\x35\x64\x56\x77\x72\x58\x43\x67\x55\x37\x44\x6e\x31\x54\x44\x6d\x41\x7a\x43\x6a\x79\x54\x44\x75\x47\x49\x5a\x77\x72\x5a\x79\x77\x6f\x39\x68\x77\x37\x54\x44\x74\x68\x6a\x43\x70\x52\x7a\x43\x6d\x46\x7a\x43\x70\x63\x4b\x2b\x53\x55\x41\x6d\x57\x69\x62\x43\x73\x38\x4f\x5a\x47\x6a\x41\x33\x45\x73\x4f\x49\x4a\x45\x66\x43\x73\x63\x4f\x39\x4d\x63\x4b\x68\x42\x42\x76\x43\x6c\x78\x41\x38\x77\x72\x4e\x66\x77\x34\x50\x44\x6d\x45\x45\x78\x54\x52\x34\x3d','\x63\x4d\x4f\x44\x4c\x78\x39\x51','\x43\x52\x39\x5a\x57\x6e\x4e\x63\x4d\x4d\x4b\x4e','\x77\x36\x58\x44\x6a\x32\x51\x55\x61\x41\x3d\x3d','\x46\x58\x76\x43\x6e\x44\x66\x44\x6a\x73\x4b\x53\x77\x6f\x31\x69\x61\x43\x76\x44\x68\x4d\x4f\x66\x4a\x73\x4b\x59','\x77\x6f\x7a\x43\x6e\x51\x4a\x41\x77\x71\x45\x3d','\x4a\x6e\x49\x6a\x77\x70\x62\x43\x6d\x4d\x4b\x4f\x77\x37\x58\x44\x72\x58\x77\x3d','\x51\x55\x30\x66\x77\x6f\x30\x7a\x52\x73\x4b\x6b\x77\x6f\x51\x3d','\x77\x6f\x6b\x38\x77\x37\x6f\x4d\x77\x34\x30\x3d','\x77\x72\x70\x56\x48\x47\x74\x39','\x4d\x4d\x4f\x47\x77\x72\x56\x32\x77\x70\x55\x3d','\x62\x6c\x66\x43\x71\x38\x4b\x72','\x77\x6f\x77\x43\x57\x46\x6c\x43','\x65\x73\x4f\x72\x4f\x69\x52\x7a','\x77\x70\x6a\x44\x6d\x6c\x5a\x64\x47\x51\x3d\x3d','\x41\x57\x72\x43\x6d\x68\x76\x44\x6a\x4d\x4b\x51','\x77\x6f\x6b\x6e\x64\x57\x68\x53','\x65\x6b\x6a\x44\x73\x54\x30\x4b\x53\x38\x4b\x42\x65\x73\x4b\x58\x77\x35\x45\x69\x77\x70\x62\x43\x6f\x6e\x54\x44\x67\x77\x3d\x3d','\x77\x6f\x63\x49\x57\x68\x76\x43\x75\x77\x3d\x3d','\x50\x73\x4f\x73\x43\x42\x2f\x43\x76\x33\x33\x43\x6e\x77\x3d\x3d','\x77\x6f\x33\x43\x67\x55\x41\x45\x52\x51\x3d\x3d','\x64\x73\x4f\x67\x77\x36\x48\x43\x74\x54\x38\x3d','\x51\x58\x62\x44\x6c\x69\x54\x44\x6e\x51\x3d\x3d','\x77\x36\x58\x43\x73\x73\x4f\x6c\x77\x70\x70\x79','\x44\x44\x74\x57\x77\x34\x45\x51\x77\x71\x49\x3d','\x77\x35\x48\x43\x75\x4d\x4b\x49\x45\x43\x45\x3d','\x61\x32\x37\x44\x74\x79\x41\x34','\x77\x37\x31\x31\x66\x4d\x4f\x76','\x4e\x7a\x39\x4d\x77\x35\x34\x39','\x77\x37\x50\x44\x67\x73\x4b\x78\x77\x36\x45\x3d','\x77\x35\x54\x43\x6e\x4d\x4b\x44\x48\x79\x73\x3d','\x4b\x79\x77\x59\x4d\x53\x66\x44\x74\x67\x3d\x3d','\x77\x35\x78\x58\x50\x6e\x6a\x43\x67\x41\x3d\x3d','\x64\x57\x6f\x35\x55\x73\x4b\x51\x77\x71\x62\x44\x6a\x41\x5a\x31\x77\x34\x7a\x43\x73\x67\x3d\x3d','\x77\x72\x62\x43\x70\x6c\x77\x72\x77\x37\x55\x3d','\x77\x6f\x5a\x4a\x77\x72\x66\x44\x6c\x4d\x4b\x33','\x77\x71\x76\x43\x69\x55\x45\x69\x51\x77\x3d\x3d','\x48\x38\x4f\x51\x4b\x44\x6e\x43\x6e\x51\x3d\x3d','\x77\x72\x38\x45\x59\x55\x39\x43\x4d\x51\x55\x44\x77\x72\x76\x43\x6f\x4d\x4f\x55','\x77\x70\x66\x43\x71\x73\x4b\x43\x77\x37\x41\x62','\x4b\x7a\x38\x63\x4e\x44\x45\x3d','\x57\x48\x6a\x43\x75\x4d\x4b\x6f\x77\x37\x34\x3d','\x77\x36\x54\x43\x6a\x38\x4f\x75\x64\x56\x67\x3d','\x41\x63\x4f\x46\x77\x71\x31\x2b\x77\x71\x38\x3d','\x45\x41\x33\x43\x70\x6b\x2f\x43\x6a\x41\x3d\x3d','\x77\x70\x2f\x43\x6c\x54\x78\x64\x77\x6f\x6b\x3d','\x77\x6f\x56\x43\x4f\x6d\x78\x5a','\x4b\x46\x6f\x2f\x77\x72\x62\x43\x69\x41\x3d\x3d','\x77\x6f\x4d\x52\x77\x35\x34\x42\x77\x72\x50\x43\x71\x63\x4f\x61\x77\x70\x33\x43\x68\x63\x4b\x34\x77\x35\x6b\x3d','\x77\x71\x55\x4f\x77\x34\x63\x34\x77\x72\x4d\x3d','\x77\x6f\x6e\x43\x6f\x63\x4f\x76\x5a\x48\x51\x3d','\x77\x70\x70\x47\x41\x57\x64\x42','\x45\x67\x51\x48\x66\x67\x3d\x3d','\x4c\x58\x34\x30\x77\x72\x6e\x43\x67\x67\x3d\x3d','\x41\x78\x35\x55\x52\x58\x4a\x4b\x49\x4d\x4b\x64\x77\x36\x58\x44\x6a\x68\x41\x3d','\x77\x70\x4c\x43\x6b\x33\x30\x46\x77\x37\x67\x3d','\x77\x6f\x39\x50\x77\x72\x72\x44\x73\x38\x4b\x6b','\x77\x70\x58\x43\x68\x38\x4b\x4d\x77\x35\x77\x6d','\x45\x42\x7a\x43\x76\x73\x4f\x50\x77\x37\x30\x3d','\x63\x38\x4b\x6d\x77\x34\x48\x43\x68\x63\x4f\x64','\x77\x37\x58\x44\x6f\x4d\x4b\x43\x77\x37\x64\x5a','\x59\x46\x33\x44\x6f\x51\x4c\x44\x75\x67\x3d\x3d','\x77\x37\x68\x67\x62\x73\x4f\x32\x49\x67\x3d\x3d','\x4f\x43\x52\x55\x65\x55\x67\x3d','\x43\x33\x77\x63\x55\x43\x44\x43\x69\x52\x44\x43\x76\x4d\x4f\x4d\x77\x70\x56\x47\x64\x4d\x4f\x33\x47\x6d\x34\x56','\x65\x4d\x4f\x65\x4e\x78\x4a\x64','\x77\x34\x6a\x43\x6a\x73\x4b\x49\x77\x72\x67\x41\x52\x42\x50\x44\x67\x73\x4f\x69\x77\x34\x44\x44\x73\x4d\x4b\x42\x77\x35\x6a\x43\x6e\x4d\x4f\x61\x77\x6f\x31\x54\x58\x73\x4f\x79\x77\x37\x38\x38\x77\x70\x37\x43\x6a\x56\x62\x44\x71\x63\x4f\x54\x77\x36\x58\x44\x6a\x53\x74\x57\x77\x35\x33\x44\x70\x47\x6b\x6f\x77\x70\x51\x78\x77\x6f\x30\x79\x44\x44\x62\x44\x6c\x4d\x4b\x4f\x42\x44\x31\x4b\x45\x53\x62\x43\x74\x38\x4b\x6b\x54\x4d\x4f\x7a\x62\x56\x6b\x4d\x4a\x6d\x76\x44\x6a\x32\x74\x79\x4b\x4d\x4b\x34\x51\x41\x3d\x3d','\x77\x35\x4d\x59\x77\x6f\x54\x44\x6d\x4d\x4f\x4d','\x43\x4d\x4f\x58\x63\x6b\x7a\x43\x6c\x77\x3d\x3d','\x77\x71\x55\x6f\x77\x35\x67\x4e','\x77\x37\x6a\x44\x74\x73\x4b\x4f\x77\x35\x42\x4c','\x77\x70\x55\x50\x77\x36\x4d\x64\x77\x35\x73\x3d','\x77\x71\x59\x71\x55\x41\x58\x43\x6d\x77\x3d\x3d','\x77\x36\x42\x67\x4e\x33\x54\x43\x71\x77\x3d\x3d','\x77\x36\x74\x2f\x55\x38\x4f\x4c\x4c\x51\x3d\x3d','\x49\x79\x45\x63\x4c\x54\x77\x3d','\x49\x7a\x59\x46\x4c\x79\x77\x3d','\x54\x32\x63\x4d\x52\x63\x4b\x32','\x4c\x63\x4f\x78\x53\x6c\x76\x43\x71\x41\x3d\x3d','\x52\x63\x4f\x73\x42\x6a\x4a\x45','\x61\x73\x4f\x62\x47\x78\x68\x38','\x77\x71\x58\x44\x6c\x63\x4f\x63\x77\x37\x39\x41','\x77\x6f\x67\x46\x62\x4d\x4b\x79\x77\x34\x6f\x3d','\x48\x56\x67\x47\x77\x6f\x48\x43\x6f\x77\x3d\x3d','\x77\x72\x63\x37\x4d\x38\x4b\x47','\x77\x34\x34\x37\x77\x6f\x54\x44\x73\x63\x4f\x54','\x57\x47\x37\x43\x6e\x4d\x4f\x43\x41\x41\x3d\x3d','\x77\x72\x67\x6a\x77\x34\x49\x4e','\x51\x6d\x54\x44\x6f\x51\x44\x44\x6d\x41\x3d\x3d','\x66\x30\x2f\x44\x6c\x51\x41\x5a','\x54\x52\x52\x39\x77\x70\x48\x43\x6d\x77\x3d\x3d','\x77\x71\x62\x44\x76\x4d\x4f\x4b\x77\x35\x6c\x73','\x45\x32\x37\x43\x6d\x42\x37\x44\x6d\x77\x3d\x3d','\x46\x77\x56\x65\x66\x57\x6b\x3d','\x77\x35\x37\x44\x75\x63\x4b\x75\x77\x34\x59\x62\x57\x73\x4b\x7a\x77\x6f\x50\x44\x6d\x67\x3d\x3d','\x43\x54\x73\x43\x4c\x44\x49\x3d','\x77\x35\x70\x39\x77\x36\x50\x44\x76\x73\x4f\x47\x5a\x69\x68\x2f\x4f\x63\x4b\x35\x5a\x38\x4b\x37\x77\x35\x33\x44\x71\x63\x4f\x77\x77\x35\x45\x59','\x50\x58\x63\x5a\x77\x70\x4c\x43\x6b\x41\x3d\x3d','\x42\x41\x66\x43\x69\x30\x33\x43\x6c\x77\x3d\x3d','\x47\x77\x62\x43\x70\x63\x4f\x4d\x77\x34\x59\x3d','\x4b\x4d\x4f\x32\x54\x55\x76\x43\x72\x4d\x4f\x51\x43\x73\x4f\x74\x77\x35\x7a\x44\x71\x38\x4f\x63\x42\x79\x54\x43\x71\x68\x78\x4c\x49\x54\x2f\x43\x76\x41\x3d\x3d','\x77\x70\x62\x43\x6f\x57\x67\x4b\x77\x34\x63\x3d','\x77\x70\x6a\x43\x6b\x53\x41\x79\x62\x63\x4b\x46\x77\x71\x70\x33\x4f\x68\x7a\x43\x70\x38\x4f\x46\x47\x73\x4f\x72\x77\x35\x5a\x52\x50\x7a\x4c\x43\x6c\x4d\x4f\x4a\x56\x4d\x4b\x55\x77\x34\x37\x44\x73\x73\x4b\x62\x77\x71\x56\x4b\x59\x38\x4f\x79\x77\x6f\x4d\x74\x63\x67\x3d\x3d','\x77\x70\x51\x67\x57\x73\x4b\x70\x77\x37\x73\x3d','\x77\x71\x76\x43\x74\x63\x4f\x4d\x64\x30\x49\x3d','\x4e\x57\x4a\x73\x57\x73\x4f\x48\x77\x70\x58\x43\x6e\x68\x41\x6d\x77\x35\x50\x44\x73\x38\x4f\x70\x58\x67\x3d\x3d','\x64\x63\x4b\x55\x77\x34\x37\x43\x6c\x73\x4f\x2f','\x41\x57\x37\x43\x68\x42\x76\x44\x6c\x67\x3d\x3d','\x77\x72\x31\x51\x46\x32\x39\x4a','\x56\x67\x5a\x41\x77\x6f\x66\x43\x68\x51\x3d\x3d','\x77\x34\x37\x44\x6a\x4d\x4b\x73\x77\x36\x46\x59','\x4b\x48\x66\x43\x6b\x41\x44\x44\x6d\x67\x3d\x3d','\x62\x48\x51\x7a\x53\x63\x4b\x33','\x42\x63\x4f\x33\x77\x72\x68\x78\x77\x70\x41\x3d','\x44\x53\x52\x57\x52\x30\x4d\x3d','\x50\x73\x4f\x73\x45\x77\x4c\x43\x70\x48\x54\x43\x69\x41\x3d\x3d','\x44\x6d\x59\x63\x51\x44\x76\x43\x6a\x42\x6f\x3d','\x77\x70\x2f\x43\x6d\x4d\x4f\x69\x5a\x58\x49\x3d','\x41\x68\x55\x48\x65\x79\x34\x3d','\x43\x57\x77\x51\x52\x6a\x4d\x3d','\x66\x30\x72\x43\x73\x4d\x4b\x36\x77\x34\x42\x44\x50\x4d\x4b\x6a\x54\x51\x3d\x3d','\x4c\x7a\x30\x65\x4e\x7a\x6f\x3d','\x77\x6f\x34\x55\x52\x4d\x4b\x32','\x48\x51\x50\x43\x71\x51\x3d\x3d','\x77\x35\x4c\x43\x70\x73\x4f\x65\x77\x72\x52\x2b','\x4e\x77\x44\x43\x6c\x56\x41\x3d','\x48\x73\x4f\x4a\x64\x56\x7a\x43\x76\x77\x3d\x3d','\x77\x70\x44\x43\x6e\x47\x49\x34\x64\x67\x3d\x3d','\x65\x56\x33\x43\x76\x63\x4b\x73\x77\x35\x39\x62\x4d\x41\x3d\x3d','\x77\x71\x77\x73\x56\x77\x4d\x3d','\x77\x72\x6e\x44\x70\x6d\x31\x6d\x49\x46\x58\x43\x73\x67\x3d\x3d','\x58\x46\x45\x64\x77\x6f\x49\x6a','\x41\x7a\x46\x57\x77\x35\x55\x4c\x77\x71\x59\x35','\x77\x36\x37\x43\x68\x38\x4f\x43\x56\x58\x67\x3d','\x59\x63\x4b\x50\x77\x34\x54\x43\x72\x73\x4f\x2f\x77\x34\x4a\x6a','\x77\x71\x6b\x74\x56\x67\x3d\x3d','\x77\x36\x6e\x43\x6a\x63\x4f\x4f\x55\x33\x44\x44\x73\x46\x4d\x3d','\x77\x70\x63\x66\x77\x34\x49\x63','\x4b\x53\x41\x43\x4b\x79\x66\x44\x74\x4d\x4b\x5a','\x77\x34\x63\x51\x77\x72\x33\x44\x6c\x38\x4f\x49\x44\x73\x4b\x7a\x77\x6f\x37\x44\x71\x41\x3d\x3d','\x53\x30\x77\x53\x77\x70\x49\x70\x54\x73\x4b\x6b','\x66\x30\x44\x43\x6f\x63\x4b\x77\x77\x34\x49\x3d','\x58\x54\x45\x44','\x55\x69\x41\x44\x52\x38\x4f\x52\x77\x71\x78\x73\x47\x56\x6a\x43\x6b\x73\x4f\x52\x77\x36\x4d\x65\x77\x36\x58\x44\x6a\x38\x4f\x34\x77\x36\x66\x43\x67\x73\x4f\x2f\x77\x34\x50\x44\x6b\x4d\x4b\x35\x77\x34\x49\x4f\x4c\x63\x4f\x37\x77\x34\x64\x66\x41\x45\x77\x41\x42\x7a\x39\x62\x5a\x63\x4b\x4f\x77\x70\x50\x44\x6a\x4d\x4b\x48\x77\x35\x4a\x46\x62\x38\x4b\x33\x77\x35\x6a\x43\x76\x41\x56\x59\x4d\x48\x51\x31\x77\x36\x4d\x3d','\x49\x6e\x44\x43\x6a\x43\x4c\x44\x6f\x77\x3d\x3d','\x77\x34\x4c\x43\x6b\x63\x4b\x4b\x42\x79\x72\x44\x69\x38\x4f\x4c\x4d\x77\x3d\x3d'];(function(_0x509555,_0x32099d){var _0x55ad96=function(_0x576f62){while(--_0x576f62){_0x509555['push'](_0x509555['shift']());}};var _0xf03261=function(){var _0x3ad63d={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x526f2d,_0x42e22e,_0x332268,_0x45adc2){_0x45adc2=_0x45adc2||{};var _0x3f39a=_0x42e22e+'='+_0x332268;var _0x19d762=0x0;for(var _0x19d762=0x0,_0x315a4d=_0x526f2d['length'];_0x19d762<_0x315a4d;_0x19d762++){var _0x5399cc=_0x526f2d[_0x19d762];_0x3f39a+=';\x20'+_0x5399cc;var _0x254a1f=_0x526f2d[_0x5399cc];_0x526f2d['push'](_0x254a1f);_0x315a4d=_0x526f2d['length'];if(_0x254a1f!==!![]){_0x3f39a+='='+_0x254a1f;}}_0x45adc2['cookie']=_0x3f39a;},'removeCookie':function(){return'dev';},'getCookie':function(_0x186520,_0x4aef17){_0x186520=_0x186520||function(_0x2208e2){return _0x2208e2;};var _0x3d36d6=_0x186520(new RegExp('(?:^|;\x20)'+_0x4aef17['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x433a28=function(_0x2b597a,_0x3d3579){_0x2b597a(++_0x3d3579);};_0x433a28(_0x55ad96,_0x32099d);return _0x3d36d6?decodeURIComponent(_0x3d36d6[0x1]):undefined;}};var _0x145f19=function(){var _0x11afea=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x11afea['test'](_0x3ad63d['removeCookie']['toString']());};_0x3ad63d['updateCookie']=_0x145f19;var _0x59e574='';var _0x2c3976=_0x3ad63d['updateCookie']();if(!_0x2c3976){_0x3ad63d['setCookie'](['*'],'counter',0x1);}else if(_0x2c3976){_0x59e574=_0x3ad63d['getCookie'](null,'counter');}else{_0x3ad63d['removeCookie']();}};_0xf03261();}(_0x55e8,0xd6));var _0x29e7=function(_0x5d5ffe,_0x43f917){_0x5d5ffe=_0x5d5ffe-0x0;var _0xb13527=_0x55e8[_0x5d5ffe];if(_0x29e7['nHXdPF']===undefined){(function(){var _0x3686b2;try{var _0x4f6764=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x3686b2=_0x4f6764();}catch(_0x78b26e){_0x3686b2=window;}var _0x41a528='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x3686b2['atob']||(_0x3686b2['atob']=function(_0x5cd5c0){var _0x3aeae5=String(_0x5cd5c0)['replace'](/=+$/,'');for(var _0x3ef6fc=0x0,_0x5f1a4c,_0x29431e,_0x33c918=0x0,_0x4c6360='';_0x29431e=_0x3aeae5['charAt'](_0x33c918++);~_0x29431e&&(_0x5f1a4c=_0x3ef6fc%0x4?_0x5f1a4c*0x40+_0x29431e:_0x29431e,_0x3ef6fc++%0x4)?_0x4c6360+=String['fromCharCode'](0xff&_0x5f1a4c>>(-0x2*_0x3ef6fc&0x6)):0x0){_0x29431e=_0x41a528['indexOf'](_0x29431e);}return _0x4c6360;});}());var _0x328905=function(_0x5859b6,_0x43f917){var _0x13f136=[],_0x41f86b=0x0,_0x37aa1d,_0x259504='',_0x241140='';_0x5859b6=atob(_0x5859b6);for(var _0x18ffc5=0x0,_0x252af7=_0x5859b6['length'];_0x18ffc5<_0x252af7;_0x18ffc5++){_0x241140+='%'+('00'+_0x5859b6['charCodeAt'](_0x18ffc5)['toString'](0x10))['slice'](-0x2);}_0x5859b6=decodeURIComponent(_0x241140);for(var _0x54a8f5=0x0;_0x54a8f5<0x100;_0x54a8f5++){_0x13f136[_0x54a8f5]=_0x54a8f5;}for(_0x54a8f5=0x0;_0x54a8f5<0x100;_0x54a8f5++){_0x41f86b=(_0x41f86b+_0x13f136[_0x54a8f5]+_0x43f917['charCodeAt'](_0x54a8f5%_0x43f917['length']))%0x100;_0x37aa1d=_0x13f136[_0x54a8f5];_0x13f136[_0x54a8f5]=_0x13f136[_0x41f86b];_0x13f136[_0x41f86b]=_0x37aa1d;}_0x54a8f5=0x0;_0x41f86b=0x0;for(var _0x34a4d8=0x0;_0x34a4d8<_0x5859b6['length'];_0x34a4d8++){_0x54a8f5=(_0x54a8f5+0x1)%0x100;_0x41f86b=(_0x41f86b+_0x13f136[_0x54a8f5])%0x100;_0x37aa1d=_0x13f136[_0x54a8f5];_0x13f136[_0x54a8f5]=_0x13f136[_0x41f86b];_0x13f136[_0x41f86b]=_0x37aa1d;_0x259504+=String['fromCharCode'](_0x5859b6['charCodeAt'](_0x34a4d8)^_0x13f136[(_0x13f136[_0x54a8f5]+_0x13f136[_0x41f86b])%0x100]);}return _0x259504;};_0x29e7['jKRBRs']=_0x328905;_0x29e7['dftGaG']={};_0x29e7['nHXdPF']=!![];}var _0x4def23=_0x29e7['dftGaG'][_0x5d5ffe];if(_0x4def23===undefined){if(_0x29e7['xlsOAU']===undefined){var _0x20d350=function(_0x2ddb4b){this['NGOncO']=_0x2ddb4b;this['ErEmNR']=[0x1,0x0,0x0];this['UsgYnN']=function(){return'newState';};this['ULIiVy']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['XGHSLe']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x20d350['prototype']['izepaX']=function(){var _0x2d45e2=new RegExp(this['ULIiVy']+this['XGHSLe']);var _0xddc8b5=_0x2d45e2['test'](this['UsgYnN']['toString']())?--this['ErEmNR'][0x1]:--this['ErEmNR'][0x0];return this['BlLbys'](_0xddc8b5);};_0x20d350['prototype']['BlLbys']=function(_0xdf02d6){if(!Boolean(~_0xdf02d6)){return _0xdf02d6;}return this['RoLbTf'](this['NGOncO']);};_0x20d350['prototype']['RoLbTf']=function(_0x57dd40){for(var _0x48b395=0x0,_0x55222e=this['ErEmNR']['length'];_0x48b395<_0x55222e;_0x48b395++){this['ErEmNR']['push'](Math['round'](Math['random']()));_0x55222e=this['ErEmNR']['length'];}return _0x57dd40(this['ErEmNR'][0x0]);};new _0x20d350(_0x29e7)['izepaX']();_0x29e7['xlsOAU']=!![];}_0xb13527=_0x29e7['jKRBRs'](_0xb13527,_0x43f917);_0x29e7['dftGaG'][_0x5d5ffe]=_0xb13527;}else{_0xb13527=_0x4def23;}return _0xb13527;};var _0x512048=function(){var _0x596965=!![];return function(_0x1138f9,_0x4a52b8){var _0x5779e4=_0x596965?function(){if(_0x4a52b8){var _0x89bb4a=_0x4a52b8['apply'](_0x1138f9,arguments);_0x4a52b8=null;return _0x89bb4a;}}:function(){};_0x596965=![];return _0x5779e4;};}();var _0x18e316=_0x512048(this,function(){var _0x2a4634=function(){return'\x64\x65\x76';},_0x585777=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x3a2b4c=function(){var _0x4f129d=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x4f129d['\x74\x65\x73\x74'](_0x2a4634['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x47b10c=function(){var _0x4e91ed=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x4e91ed['\x74\x65\x73\x74'](_0x585777['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x203fcb=function(_0x28f9cb){var _0x3b8a16=~-0x1>>0x1+0xff%0x0;if(_0x28f9cb['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x3b8a16)){_0x178eab(_0x28f9cb);}};var _0x178eab=function(_0x50b050){var _0x187570=~-0x4>>0x1+0xff%0x0;if(_0x50b050['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x187570){_0x203fcb(_0x50b050);}};if(!_0x3a2b4c()){if(!_0x47b10c()){_0x203fcb('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x203fcb('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x203fcb('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x18e316();var _0x3c28df=function(){var _0x4092c3=!![];return function(_0x5642df,_0x2af121){var _0x111316=_0x4092c3?function(){if(_0x2af121){var _0x44c813=_0x2af121[_0x29e7('0x0','\x25\x6c\x73\x74')](_0x5642df,arguments);_0x2af121=null;return _0x44c813;}}:function(){};_0x4092c3=![];return _0x111316;};}();(function(){var _0x44e938={};_0x44e938[_0x29e7('0x1','\x5b\x69\x71\x6c')]=_0x29e7('0x2','\x6d\x4a\x6e\x74');_0x44e938[_0x29e7('0x3','\x45\x73\x4c\x56')]=_0x29e7('0x4','\x23\x67\x41\x4d');_0x44e938[_0x29e7('0x5','\x21\x30\x35\x4e')]=function(_0x191ee2,_0x43055c){return _0x191ee2(_0x43055c);};_0x44e938[_0x29e7('0x6','\x6d\x56\x44\x55')]=_0x29e7('0x7','\x40\x54\x76\x65');_0x44e938[_0x29e7('0x8','\x23\x67\x41\x4d')]=function(_0xf984d4,_0x239445){return _0xf984d4+_0x239445;};_0x44e938[_0x29e7('0x9','\x40\x54\x76\x65')]=_0x29e7('0xa','\x50\x6b\x6d\x38');_0x44e938[_0x29e7('0xb','\x76\x73\x69\x5a')]=function(_0x300903,_0x6034f0){return _0x300903+_0x6034f0;};_0x44e938[_0x29e7('0xc','\x25\x6c\x73\x74')]=_0x29e7('0xd','\x67\x2a\x42\x63');_0x44e938[_0x29e7('0xe','\x67\x2a\x42\x63')]=function(_0x5286d8,_0x39a514){return _0x5286d8(_0x39a514);};_0x44e938[_0x29e7('0xf','\x48\x26\x49\x46')]=function(_0x31f837){return _0x31f837();};_0x44e938[_0x29e7('0x10','\x6d\x56\x44\x55')]=function(_0xaf030e,_0x496647,_0x285aba){return _0xaf030e(_0x496647,_0x285aba);};_0x44e938[_0x29e7('0x11','\x45\x73\x4c\x56')](_0x3c28df,this,function(){var _0x31b76c=new RegExp(_0x44e938[_0x29e7('0x12','\x45\x73\x4c\x56')]);var _0x30da34=new RegExp(_0x44e938[_0x29e7('0x13','\x5e\x46\x26\x73')],'\x69');var _0x47bf2b=_0x44e938[_0x29e7('0x14','\x32\x6f\x35\x69')](_0x2e3039,_0x44e938[_0x29e7('0x15','\x4b\x55\x68\x49')]);if(!_0x31b76c[_0x29e7('0x16','\x63\x42\x67\x6a')](_0x44e938[_0x29e7('0x17','\x21\x30\x35\x4e')](_0x47bf2b,_0x44e938[_0x29e7('0x18','\x37\x49\x6e\x24')]))||!_0x30da34[_0x29e7('0x19','\x40\x54\x76\x65')](_0x44e938[_0x29e7('0x1a','\x25\x29\x72\x57')](_0x47bf2b,_0x44e938[_0x29e7('0x1b','\x32\x6a\x6f\x64')]))){_0x44e938[_0x29e7('0x1c','\x44\x56\x30\x69')](_0x47bf2b,'\x30');}else{_0x44e938[_0x29e7('0x1d','\x5e\x46\x26\x73')](_0x2e3039);}})();}());var _0x4676ea=function(){var _0x221279=!![];return function(_0x3d79f5,_0x55c005){var _0x5d2cd6=_0x221279?function(){if(_0x55c005){var _0x15cfde=_0x55c005[_0x29e7('0x1e','\x73\x68\x79\x65')](_0x3d79f5,arguments);_0x55c005=null;return _0x15cfde;}}:function(){};_0x221279=![];return _0x5d2cd6;};}();var _0x46137a=_0x4676ea(this,function(){var _0x47497c={};_0x47497c[_0x29e7('0x1f','\x5b\x69\x71\x6c')]=_0x29e7('0x20','\x5e\x46\x26\x73');_0x47497c[_0x29e7('0x21','\x67\x2a\x42\x63')]=_0x29e7('0x22','\x42\x4b\x79\x5e');_0x47497c[_0x29e7('0x23','\x4b\x55\x68\x49')]=function(_0x491f05,_0x9b2cef){return _0x491f05(_0x9b2cef);};_0x47497c[_0x29e7('0x24','\x64\x21\x28\x55')]=function(_0x4d9eb9,_0x335b4b){return _0x4d9eb9+_0x335b4b;};_0x47497c[_0x29e7('0x25','\x7a\x4b\x21\x49')]=_0x29e7('0x26','\x6d\x56\x44\x55');_0x47497c[_0x29e7('0x27','\x5e\x71\x61\x53')]=_0x29e7('0x28','\x6a\x4e\x6f\x43');_0x47497c[_0x29e7('0x29','\x32\x6f\x35\x69')]=function(_0xe13af){return _0xe13af();};_0x47497c[_0x29e7('0x2a','\x6f\x71\x63\x41')]=_0x29e7('0x2b','\x48\x26\x49\x46');var _0x40f121=_0x47497c[_0x29e7('0x2c','\x6f\x6a\x65\x4f')][_0x29e7('0x2d','\x73\x68\x79\x65')]('\x7c'),_0x5ea2f0=0x0;while(!![]){switch(_0x40f121[_0x5ea2f0++]){case'\x30':var _0x23c00b=function(){};continue;case'\x31':var _0x2d963e={};_0x2d963e[_0x29e7('0x2e','\x59\x59\x5b\x71')]=_0x47497c.Ctntz;continue;case'\x32':try{var _0x128f63=_0x47497c[_0x29e7('0x2f','\x44\x56\x30\x69')](Function,_0x47497c[_0x29e7('0x30','\x23\x67\x41\x4d')](_0x47497c[_0x29e7('0x31','\x73\x68\x79\x65')](_0x47497c[_0x29e7('0x32','\x48\x26\x49\x46')],_0x47497c[_0x29e7('0x33','\x6a\x4c\x34\x6a')]),'\x29\x3b'));_0x1f8e6d=_0x47497c[_0x29e7('0x34','\x5b\x69\x71\x6c')](_0x128f63);}catch(_0x416915){_0x1f8e6d=window;}continue;case'\x33':if(!_0x1f8e6d[_0x29e7('0x35','\x6b\x4d\x6d\x7a')]){_0x1f8e6d[_0x29e7('0x36','\x6d\x4a\x6e\x74')]=function(_0x23c00b){var _0x4b0f35=_0x2d963e[_0x29e7('0x37','\x6f\x71\x63\x41')][_0x29e7('0x38','\x34\x52\x64\x48')]('\x7c'),_0x10ff91=0x0;while(!![]){switch(_0x4b0f35[_0x10ff91++]){case'\x30':_0x44a8b4[_0x29e7('0x39','\x6d\x4a\x6e\x74')]=_0x23c00b;continue;case'\x31':return _0x44a8b4;case'\x32':_0x44a8b4[_0x29e7('0x3a','\x41\x66\x28\x28')]=_0x23c00b;continue;case'\x33':var _0x44a8b4={};continue;case'\x34':_0x44a8b4[_0x29e7('0x3b','\x67\x2a\x42\x63')]=_0x23c00b;continue;case'\x35':_0x44a8b4[_0x29e7('0x3c','\x32\x6f\x35\x69')]=_0x23c00b;continue;case'\x36':_0x44a8b4[_0x29e7('0x3d','\x7a\x4b\x21\x49')]=_0x23c00b;continue;case'\x37':_0x44a8b4[_0x29e7('0x3e','\x68\x5d\x36\x25')]=_0x23c00b;continue;case'\x38':_0x44a8b4[_0x29e7('0x3f','\x64\x21\x28\x55')]=_0x23c00b;continue;}break;}}(_0x23c00b);}else{var _0x454e71=_0x47497c[_0x29e7('0x40','\x6d\x56\x44\x55')][_0x29e7('0x41','\x6a\x4e\x6f\x43')]('\x7c'),_0x4c4db1=0x0;while(!![]){switch(_0x454e71[_0x4c4db1++]){case'\x30':_0x1f8e6d[_0x29e7('0x42','\x41\x66\x28\x28')][_0x29e7('0x43','\x50\x6b\x6d\x38')]=_0x23c00b;continue;case'\x31':_0x1f8e6d[_0x29e7('0x44','\x50\x6b\x28\x71')][_0x29e7('0x45','\x6e\x23\x39\x44')]=_0x23c00b;continue;case'\x32':_0x1f8e6d[_0x29e7('0x46','\x38\x43\x25\x69')][_0x29e7('0x47','\x4d\x5d\x4c\x68')]=_0x23c00b;continue;case'\x33':_0x1f8e6d[_0x29e7('0x48','\x6f\x6a\x65\x4f')][_0x29e7('0x49','\x50\x6b\x6d\x38')]=_0x23c00b;continue;case'\x34':_0x1f8e6d[_0x29e7('0x4a','\x4d\x5d\x4c\x68')][_0x29e7('0x4b','\x5d\x47\x49\x4d')]=_0x23c00b;continue;case'\x35':_0x1f8e6d[_0x29e7('0x4c','\x67\x2a\x42\x63')][_0x29e7('0x4d','\x21\x30\x35\x4e')]=_0x23c00b;continue;case'\x36':_0x1f8e6d[_0x29e7('0x4e','\x6e\x23\x39\x44')][_0x29e7('0x4f','\x41\x66\x28\x28')]=_0x23c00b;continue;}break;}}continue;case'\x34':var _0x1f8e6d;continue;}break;}});_0x46137a();$[_0x29e7('0x50','\x4a\x5d\x4c\x6a')](_0x29e7('0x51','\x4a\x5d\x4c\x6a'),null,function(_0x26ebd9){var _0x4af9b9={};_0x4af9b9[_0x29e7('0x52','\x73\x68\x79\x65')]=_0x29e7('0x53','\x6f\x75\x29\x29');_0x4af9b9[_0x29e7('0x54','\x37\x49\x6e\x24')]=_0x29e7('0x55','\x64\x21\x28\x55');_0x4af9b9[_0x29e7('0x56','\x67\x2a\x42\x63')]=_0x29e7('0x57','\x37\x49\x6e\x24');_0x4af9b9[_0x29e7('0x58','\x45\x73\x4c\x56')]=function(_0x4c9ca4,_0x2af9a3,_0x5f224b){return _0x4c9ca4(_0x2af9a3,_0x5f224b);};if(_0x26ebd9[_0x29e7('0x59','\x5b\x69\x71\x6c')]('\x74')){_0x4af9b9[_0x29e7('0x5a','\x52\x6f\x32\x36')](setInterval,function(){let _0x4ed2e9=document[_0x29e7('0x5b','\x73\x68\x79\x65')](_0x4af9b9[_0x29e7('0x5c','\x7a\x4e\x28\x4e')]);if(!_0x4ed2e9)return;if(_0x4ed2e9[_0x29e7('0x5d','\x4b\x55\x68\x49')][_0x29e7('0x5e','\x6e\x23\x39\x44')](_0x4af9b9[_0x29e7('0x5f','\x40\x54\x76\x65')])){document[_0x29e7('0x60','\x59\x59\x5b\x71')](_0x4af9b9[_0x29e7('0x61','\x6a\x4c\x34\x6a')]);}},0x0);}},_0x29e7('0x62','\x41\x66\x28\x28'));setInterval(function(){var _0x33a949={};_0x33a949[_0x29e7('0x63','\x24\x24\x40\x46')]=function(_0x718c84){return _0x718c84();};_0x33a949[_0x29e7('0x63','\x24\x24\x40\x46')](_0x2e3039);},0xfa0);function _0x2e3039(_0x5711bd){var _0x1ef0c5={};_0x1ef0c5[_0x29e7('0x64','\x45\x73\x4c\x56')]=function(_0x286f13,_0x2bfde5){return _0x286f13===_0x2bfde5;};_0x1ef0c5[_0x29e7('0x65','\x50\x6b\x28\x71')]=_0x29e7('0x66','\x73\x68\x79\x65');_0x1ef0c5[_0x29e7('0x67','\x24\x24\x40\x46')]=_0x29e7('0x68','\x32\x6a\x6f\x64');_0x1ef0c5[_0x29e7('0x69','\x50\x6b\x6d\x38')]=_0x29e7('0x6a','\x6b\x4d\x6d\x7a');_0x1ef0c5[_0x29e7('0x6b','\x6a\x4e\x6f\x43')]=function(_0x1dc1ad,_0xc0c54e){return _0x1dc1ad!==_0xc0c54e;};_0x1ef0c5[_0x29e7('0x6c','\x4f\x46\x21\x46')]=function(_0x982849,_0x5affb7){return _0x982849+_0x5affb7;};_0x1ef0c5[_0x29e7('0x6d','\x25\x29\x72\x57')]=function(_0x4d5bba,_0xf27a25){return _0x4d5bba/_0xf27a25;};_0x1ef0c5[_0x29e7('0x6e','\x68\x5d\x36\x25')]=_0x29e7('0x6f','\x38\x43\x25\x69');_0x1ef0c5[_0x29e7('0x70','\x6f\x75\x29\x29')]=function(_0x87f3bd,_0x5b7932){return _0x87f3bd%_0x5b7932;};_0x1ef0c5[_0x29e7('0x71','\x32\x6a\x6f\x64')]=_0x29e7('0x72','\x25\x6c\x73\x74');_0x1ef0c5[_0x29e7('0x73','\x38\x43\x25\x69')]=_0x29e7('0x74','\x23\x67\x41\x4d');_0x1ef0c5[_0x29e7('0x75','\x6f\x75\x29\x29')]=_0x29e7('0x76','\x67\x2a\x42\x63');_0x1ef0c5[_0x29e7('0x77','\x76\x73\x69\x5a')]=_0x29e7('0x78','\x48\x26\x49\x46');_0x1ef0c5[_0x29e7('0x79','\x5e\x71\x61\x53')]=function(_0x4a08de,_0xeeec74){return _0x4a08de(_0xeeec74);};_0x1ef0c5[_0x29e7('0x7a','\x42\x4b\x79\x5e')]=function(_0x196dbd,_0x1709c9){return _0x196dbd(_0x1709c9);};function _0x49e6f7(_0x3c5fdc){if(_0x1ef0c5[_0x29e7('0x7b','\x6a\x4e\x6f\x43')](typeof _0x3c5fdc,_0x1ef0c5[_0x29e7('0x7c','\x6b\x4d\x6d\x7a')])){return function(_0x5c6435){}[_0x29e7('0x7d','\x24\x24\x40\x46')](_0x1ef0c5[_0x29e7('0x7e','\x63\x35\x42\x4b')])[_0x29e7('0x7f','\x67\x2a\x42\x63')](_0x1ef0c5[_0x29e7('0x80','\x41\x66\x28\x28')]);}else{if(_0x1ef0c5[_0x29e7('0x81','\x4d\x5d\x4c\x68')](_0x1ef0c5[_0x29e7('0x82','\x6a\x4c\x34\x6a')]('',_0x1ef0c5[_0x29e7('0x83','\x64\x21\x28\x55')](_0x3c5fdc,_0x3c5fdc))[_0x1ef0c5[_0x29e7('0x84','\x7a\x4e\x28\x4e')]],0x1)||_0x1ef0c5[_0x29e7('0x85','\x59\x59\x5b\x71')](_0x1ef0c5[_0x29e7('0x86','\x4b\x55\x68\x49')](_0x3c5fdc,0x14),0x0)){(function(){return!![];}[_0x29e7('0x87','\x5d\x47\x49\x4d')](_0x1ef0c5[_0x29e7('0x88','\x5d\x47\x49\x4d')](_0x1ef0c5[_0x29e7('0x89','\x6f\x71\x63\x41')],_0x1ef0c5[_0x29e7('0x8a','\x59\x59\x5b\x71')]))[_0x29e7('0x8b','\x34\x52\x64\x48')](_0x1ef0c5[_0x29e7('0x8c','\x4b\x55\x68\x49')]));}else{(function(){return![];}[_0x29e7('0x8d','\x5b\x69\x71\x6c')](_0x1ef0c5[_0x29e7('0x8e','\x5e\x71\x61\x53')](_0x1ef0c5[_0x29e7('0x8f','\x42\x4b\x79\x5e')],_0x1ef0c5[_0x29e7('0x90','\x63\x35\x42\x4b')]))[_0x29e7('0x91','\x7a\x4b\x21\x49')](_0x1ef0c5[_0x29e7('0x92','\x6f\x6a\x65\x4f')]));}}_0x1ef0c5[_0x29e7('0x93','\x23\x67\x41\x4d')](_0x49e6f7,++_0x3c5fdc);}try{if(_0x5711bd){return _0x49e6f7;}else{_0x1ef0c5[_0x29e7('0x94','\x25\x29\x72\x57')](_0x49e6f7,0x0);}}catch(_0x1be503){}}

(function(){
    var hideHook = function(fn, oFn) { fn.toString = oFn.toString.bind(oFn); }

    const handler = {
      construct(target, args) {
        if (args[1].length > 840000) {
            args[1] = patch(args[1]);
        }
        return new target(...args);
      }
    };

    var original_Function = unsafeWindow.Function;
    unsafeWindow.Function = new Proxy(Function, handler);
    hideHook(unsafeWindow.Function, original_Function);
})()
