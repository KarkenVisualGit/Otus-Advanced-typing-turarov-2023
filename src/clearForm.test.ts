import { TaskCalendar } from "./TaskCalendar";

class TestableTaskCalendar extends TaskCalendar {
	public async testclearForm(): Promise<void> {
		return this.clearForm();
	}
}

describe("TaskCalendar", () => {
	let taskCalendar: TestableTaskCalendar;

	beforeEach(() => {
		document.body.innerHTML = `
            <textarea id="taskText">Test Text</textarea>
            <input id="taskDate" value="2021-01-01"/>
            <select id="taskStatus">
                <option value="new">New</option>
                <option value="in progress" selected>In Progress</option>
                <option value="done">Done</option>
            </select>
            <input id="taskTags" value="Tag1, Tag2"/>
            <button id="addOrUpdateTaskButton" data-editing-id="123"></button>
        `;

		taskCalendar = new TestableTaskCalendar("testNamespace");
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("should clear form correctly", () => {
		taskCalendar.testclearForm();

		expect(
			(document.getElementById("taskText") as HTMLTextAreaElement).value
		).toBe("");
		expect(
			(document.getElementById("taskDate") as HTMLInputElement).value
		).toBe("");
		expect(
			(document.getElementById("taskStatus") as HTMLSelectElement).value
		).toBe("");
		expect(
			(document.getElementById("taskTags") as HTMLInputElement).value
		).toBe("");

		expect(
			(document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement)
				.dataset.editingId
		).toBeUndefined();
	});
});
