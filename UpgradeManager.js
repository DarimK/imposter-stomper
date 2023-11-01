class UpgradeManager
{
    constructor(menuDOM, buttonDOM, size) {
        this.menuDOM = menuDOM;
        this.buttonDOM = buttonDOM;
        this.width = size;
        this.height = size / 3 * 2;
        this.buttonHeight = size / 4;
        this.buttons = {};
        this.points = 0;

        menuDOM.style.width = this.width;
        menuDOM.style.height = this.height;
        menuDOM.style.padding = size / 5;
        menuDOM.style.fontSize = size / 5;
        document.getElementById('upgradeText').textContent = `points: ${this.points}`;
    }

    reset() {
        let upgradeM = this;
        Object.keys(this.buttons).forEach(function (name) {
            upgradeM.menuDOM.removeChild(upgradeM.buttons[name]);
        });

        this.points = 0;
        this.buttons = {};
        this.height = this.width / 2;
        this.hide();
    }

    show() {
        this.menuDOM.style.display = "block";
    }

    hide() {
        this.menuDOM.style.display = "none";
    }

    addPoints(amount = 1) {
        this.points += amount;
        document.getElementById('upgradeText').textContent = `points: ${this.points}`;
    }

    addButton(name, operation) {
        this.buttons[name] = this.buttonDOM.cloneNode(true);
        this.buttons[name].textContent = name;
        this.buttons[name].style.display = "block";
        this.buttons[name].style.width = this.width;
        this.buttons[name].style.height = this.buttonHeight;
        this.buttons[name].style.fontSize = this.width / 8;

        let upgradeM = this;
        this.buttons[name].onclick = function () {
            if (upgradeM.points > 0) {
                let newValues = operation();
                upgradeM.points--;
                this.textContent = `${name}: ${Math.round(newValues[0] * 100) / 100} > ${Math.round(newValues[1] * 100) / 100}`;
                this.style.fontSize = upgradeM.width / 8 - (this.textContent.length - name.length) / 2;
                document.getElementById('upgradeText').textContent = `points: ${upgradeM.points}`;
            }
        };

        this.menuDOM.appendChild(this.buttons[name]);
        this.height += this.buttonHeight;
        this.menuDOM.style.height = this.height;
    }
}