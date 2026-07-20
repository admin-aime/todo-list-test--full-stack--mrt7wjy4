export default function ModelOverview() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Model Overview</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            What is Todo App?
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Todo App is a personal task management tool that helps you organize your daily
            work, track deadlines, and stay productive. It provides a clean, intuitive
            interface to create, prioritize, and complete tasks across different categories.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Main Features
          </h2>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li>
              <strong className="text-gray-900 dark:text-white">Dashboard —</strong>{' '}
              Get an at-a-glance view of your task statistics: total tasks, completed,
              pending, overdue items, and upcoming deadlines. The completion rate bar
              shows your overall progress.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Task Management —</strong>{' '}
              Create, edit, and delete tasks. Each task can have a title, description,
              priority level (Low, Medium, High), category, and due date. Mark tasks as
              complete with a single click.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Search & Filters —</strong>{' '}
              Search tasks by keyword, filter by status (All, Active, Completed),
              priority, and category. Sort by creation date, due date, or priority
              level.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Light & Dark Mode —</strong>{' '}
              Toggle between light and dark themes using the sun/moon icon in the
              sidebar. Your preference is saved automatically.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">User Accounts —</strong>{' '}
              Create an account with your name, email, and password to keep your tasks
              private and accessible only to you. Sign in on any device to pick up
              where you left off.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            How to Use
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Create an account or sign in from the login page.</li>
            <li>The Dashboard shows your task summary — click "View all tasks" to go to the task list.</li>
            <li>Click <strong>Add Task</strong> to create a new task. Fill in the title, optionally add a description, pick a priority, category, and due date.</li>
            <li>Use the search bar and filter panel to find specific tasks.</li>
            <li>Click the circle icon next to any task to mark it complete. Click again to undo.</li>
            <li>Use the edit (pencil) and delete (trash) icons to manage individual tasks.</li>
            <li>Toggle dark mode from the sidebar for comfortable viewing at any time of day.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Pages
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li><strong>Login / Register</strong> — Create or access your account.</li>
            <li><strong>Dashboard</strong> — View task statistics and upcoming deadlines.</li>
            <li><strong>Tasks</strong> — Full task list with search, filters, and CRUD operations.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
