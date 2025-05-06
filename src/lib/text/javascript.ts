export const javascriptCode = 'const config = {\n\
    api: {\n\
        baseUrl: "https://api.example.com",\n\
        endpoints: ["users", "posts", "comments"],\n\
        timeouts: {\n\
            request: 5000,\n\
            retry: [1000, 3000, 5000],\n\
        },\n\
    },\n\
    user: {\n\
        permissions: ["read", "write", "admin"],\n\
        preferences: {\n\
            theme: "dark",\n\
            notifications: {\n\
                email: true,\n\
                push: false,\n\
                frequency: "daily",\n\
            },\n\
        },\n\
    },\n\
};\n\
\n\
// Arrow functions with array methods\n\
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\
const doubled = numbers.map((n) => n * 2);\n\
const filtered = numbers.filter((n) => n % 2 === 0);\n\
const sum = numbers.reduce((acc, n) => acc + n, 0);\n\
\n\
// Destructuring with defaults\n\
const getFullName = ({ firstName, lastName, title = "Ms." }) => {\n\
    return `${title} ${firstName} ${lastName}`;\n\
};\n\
\n\
// Rest and spread operators\n\
const mergeObjects = (target, ...sources) => {\n\
    return Object.assign({}, target, ...sources);\n\
};\n\
\n\
// Template literals with expressions\n\
const greeting = (name, items) => {\n\
    return `Hello ${name}! You have ${items.length} items in \n\
            your cart: ${items.join(", ")}.`;\n\
};\n\
\n\
// Async/await with try/catch\n\
const fetchUserData = async (userId) => {\n\
    try {\n\
        const response = await fetch(\n\
            `${config.api.baseUrl}/users/${userId}`\n\
        );\n\
        \n\
        if (!response.ok) {\n\
            throw new Error(`HTTP error: ${response.status}`);\n\
        }\n\
        \n\
        const data = await response.json();\n\
        const { name, email, posts } = data;\n\
        \n\
        return {\n\
            user: { name, email },\n\
            stats: {\n\
                postCount: posts.length,\n\
                lastActive: new Date(posts[0]?.createdAt || Date.now()),\n\
            },\n\
        };\n\
    } catch (error) {\n\
        console.error(`Failed to fetch user: ${error.message}`);\n\
        return null;\n\
    }\n\
};\n\
\n\
// Class with private fields, getters and setters\n\
class TaskManager {\n\
    #tasks = [];\n\
    #nextId = 1;\n\
    \n\
    constructor(initialTasks = []) {\n\
        initialTasks.forEach((task) => this.addTask(task));\n\
    }\n\
    \n\
    addTask({ title, priority = "medium", completed = false }) {\n\
        this.#tasks.push({\n\
            id: this.#nextId++,\n\
            title,\n\
            priority,\n\
            completed,\n\
            createdAt: new Date(),\n\
        });\n\
    }\n\
    \n\
    get pendingTasks() {\n\
        return this.#tasks.filter((task) => !task.completed);\n\
    }\n\
    \n\
    get completedTasks() {\n\
        return this.#tasks.filter((task) => task.completed);\n\
    }\n\
    \n\
    findTaskById(id) {\n\
        return this.#tasks.find((task) => task.id === id);\n\
    }\n\
    \n\
    updateTask(id, updates) {\n\
        const index = this.#tasks.findIndex((task) => task.id === id);\n\
        if (index !== -1) {\n\
            this.#tasks[index] = {\n\
                ...this.#tasks[index],\n\
                ...updates,\n\
                updatedAt: new Date(),\n\
            };\n\
            return true;\n\
        }\n\
        return false;\n\
    }\n\
    \n\
    deleteTask(id) {\n\
        const index = this.#tasks.findIndex((task) => task.id === id);\n\
        if (index !== -1) {\n\
            this.#tasks.splice(index, 1);\n\
            return true;\n\
        }\n\
        return false;\n\
    }\n\
}\n\
\n\
// Generator function\n\
function* fibonacci() {\n\
    let [prev, curr] = [0, 1];\n\
    while (true) {\n\
        yield curr;\n\
        [prev, curr] = [curr, prev + curr];\n\
    }\n\
}\n\
\n\
// Using the generator\n\
const getFibonacciSequence = (limit) => {\n\
    const sequence = [];\n\
    const generator = fibonacci();\n\
    \n\
    for (let i = 0; i < limit; i++) {\n\
        sequence.push(generator.next().value);\n\
    }\n\
    \n\
    return sequence;\n\
};\n\
\n\
// Promise-based utilities\n\
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));\n\
\n\
const retry = async (fn, attempts = 3, delayMs = 1000) => {\n\
    for (let i = 0; i < attempts; i++) {\n\
        try {\n\
            return await fn();\n\
        } catch (error) {\n\
            if (i === attempts - 1) throw error;\n\
            console.warn(`Attempt ${i + 1} failed, retrying...`);\n\
            await delay(delayMs);\n\
        }\n\
    }\n\
};\n\
\n\
// Maps and Sets\n\
const processUserRoles = (users) => {\n\
    const roleMap = new Map();\n\
    const uniqueEmails = new Set();\n\
    \n\
    users.forEach(({ email, roles }) => {\n\
        uniqueEmails.add(email);\n\
        roles.forEach((role) => {\n\
            if (!roleMap.has(role)) {\n\
                roleMap.set(role, []);\n\
            }\n\
            roleMap.get(role).push(email);\n\
        });\n\
    });\n\
    \n\
    return {\n\
        uniqueUsers: uniqueEmails.size,\n\
        roleDistribution: Object.fromEntries(roleMap),\n\
    };\n\
};\n\
\n\
// Usage example\n\
(async () => {\n\
    // Create a task manager instance\n\
    const taskManager = new TaskManager([\n\
        { title: "Learn JavaScript", priority: "high" },\n\
        { title: "Build a project", priority: "medium" },\n\
    ]);\n\
    \n\
    // Add some more tasks\n\
    taskManager.addTask({ title: "Write tests", priority: "high" });\n\
    taskManager.addTask({ title: "Deploy application" });\n\
    \n\
    // Update a task\n\
    taskManager.updateTask(2, { completed: true });\n\
    \n\
    // Logging with object destructuring\n\
    const { pendingTasks, completedTasks } = taskManager;\n\
    console.log(\n\
        `Tasks: ${pendingTasks.length} pending, ${completedTasks.length} completed`\n\
    );\n\
    \n\
    // Calculate Fibonacci numbers\n\
    const fibNumbers = getFibonacciSequence(10);\n\
    console.log(`First 10 Fibonacci numbers: ${fibNumbers.join(", ")}`);\n\
    \n\
    // Simulate API call with retry\n\
    try {\n\
        const userData = await retry(\n\
            () => fetchUserData("user123"),\n\
            3,\n\
            1000\n\
        );\n\
        console.log(`User data: ${JSON.stringify(userData, null, 2)}`);\n\
    } catch (error) {\n\
        console.error(`Failed after retries: ${error.message}`);\n\
    }\n\
})();'.replaceAll('    ', '\t');
