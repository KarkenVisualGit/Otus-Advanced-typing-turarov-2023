import { set, ref, getDatabase } from "firebase/database";
import { TaskCalendar } from "./TaskCalendar";

jest.mock("firebase/app", () => ({
	initializeApp: jest.fn(),
}));

jest.mock("firebase/database", () => ({
	getDatabase: jest.fn().mockReturnValue("mockedDatabaseInstance"),
	ref: jest.fn().mockImplementation((database, path) => `${database}-${path}`),
	set: jest.fn(),
	get: jest.fn(),
	remove: jest.fn(),
}));

class TestableTaskCalendar extends TaskCalendar {
	public async testwriteToDoList(
		id: string,
		text: string,
		date: string,
		status: string,
		tags: string[]
	): Promise<void> {
		return this.writeToDoList(id, text, date, status, tags);
	}
}

describe("TaskCalendar", () => {
	let taskCalendar: TestableTaskCalendar;

	beforeEach(() => {
		taskCalendar = new TestableTaskCalendar("testNamespace");
	});

	it("should correctly write data to Firebase", async () => {
		const mockTask = {
			id: "testId",
			text: "Test Task",
			date: "2023-01-01",
			status: "new",
			tags: ["tag1", "tag2"],
		};

		await taskCalendar.testwriteToDoList(
			mockTask.id,
			mockTask.text,
			mockTask.date,
			mockTask.status,
			mockTask.tags
		);

		expect(ref).toHaveBeenCalledWith(
			"mockedDatabaseInstance",
			`todos/${mockTask.id}`
		);
		expect(set).toHaveBeenCalledWith(`${getDatabase()}-todos/${mockTask.id}`, {
			text: mockTask.text,
			date: mockTask.date,
			status: mockTask.status,
			tags: mockTask.tags.join(", "),
		});
	});
});
