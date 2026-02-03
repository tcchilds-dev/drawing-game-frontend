<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
    <legend class="fieldset-legend">Game Configuration</legend>

    <label class="label">Private</label>
    <input type="checkbox" class="toggle toggle-success" />

    <label class="label">Max Players</label>
    <div class="w-full max-w-xs">
        <input type="range" min="2" max="12" value="6" class="range range-primary" step="1" />
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

    <label class="label">Word Selection</label>
    <select class="select w-25">
        <option>3</option>
        <option>5</option>
    </select>

    <label class="label">Drawing Time (seconds)</label>
    <input type="number" placeholder="seconds" defaultValue="60" class="input w-25" />

    <label class="label">Number of Rounds</label>
    <div class="w-full max-w-xs">
        <input type="range" min="1" max="10" value="3" class="range range-primary" step="1" />
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
