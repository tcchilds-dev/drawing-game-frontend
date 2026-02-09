<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
    <legend class="fieldset-legend">Game Configuration</legend>

    <label class="label" for="config-private">Private</label>
    <input id="config-private" type="checkbox" class="toggle toggle-success" />

    <label class="label" for="config-max-players">Max Players</label>
    <div class="w-full max-w-xs">
        <input
            id="config-max-players"
            type="range"
            min="2"
            max="12"
            value="6"
            class="range range-primary"
            step="1"
        />
        <div class="flex justify-between px-2.5 mt-2 text-xs">
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
            <span>9</span>
            <span>10</span>
            <span>11</span>
            <span>12</span>
        </div>
    </div>

    <label class="label" for="config-word-selection">Word Selection</label>
    <select id="config-word-selection" class="select w-25">
        <option>3</option>
        <option>5</option>
    </select>

    <label class="label" for="config-drawing-time">Drawing Time (seconds)</label>
    <input id="config-drawing-time" type="number" placeholder="seconds" defaultValue="60" class="input w-25" />

    <label class="label" for="config-number-of-rounds">Number of Rounds</label>
    <div class="w-full max-w-xs">
        <input
            id="config-number-of-rounds"
            type="range"
            min="1"
            max="10"
            value="3"
            class="range range-primary"
            step="1"
        />
        <div class="flex justify-between px-2.5 mt-2 text-xs">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
            <span>9</span>
            <span>10</span>
        </div>
    </div>
</fieldset>
