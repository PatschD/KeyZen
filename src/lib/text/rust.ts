export const rust = `use std::collections::{HashMap, HashSet};
use std::fmt::{self, Display, Formatter};
use std::sync::{Arc, Mutex};
use std::error::Error;

// Custom error type
#[derive(Debug)]
enum TaskError {
    NotFound(String),
    InvalidInput(String),
    StorageError(String),
}

impl Display for TaskError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            TaskError::NotFound(msg) => write!(f, "Not found: {}", msg),
            TaskError::InvalidInput(msg) => {
                write!(f, "Invalid input: {}", msg)
            }
            TaskError::StorageError(msg) => {
                write!(f, "Storage error: {}", msg)
            }
        }
    }
}

impl Error for TaskError {}

// Type alias for Result with our custom error
type Result<T> = std::result::Result<T, TaskError>;

// Priority enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

impl Display for Priority {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Priority::Low => write!(f, "Low"),
            Priority::Medium => write!(f, "Medium"),
            Priority::High => write!(f, "High"),
            Priority::Critical => write!(f, "Critical"),
        }
    }
}

// Task status
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Status {
    Todo,
    InProgress,
    Blocked,
    Completed,
}

impl Display for Status {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Status::Todo => write!(f, "To Do"),
            Status::InProgress => write!(f, "In Progress"),
            Status::Blocked => write!(f, "Blocked"),
            Status::Completed => write!(f, "Completed"),
        }
    }
}

// Date struct
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
struct Date {
    year: u16,
    month: u8,
    day: u8,
}

impl Date {
    fn new(year: u16, month: u8, day: u8) -> Result<Self> {
        // Basic validation
        if month < 1 || month > 12 {
            return Err(TaskError::InvalidInput(
                "Month must be between 1 and 12".to_string()
            ));
        }
        
        if day < 1 || day > 31 {
            return Err(TaskError::InvalidInput(
                "Day must be between 1 and 31".to_string()
            ));
        }
        
        Ok(Self { year, month, day })
    }
    
    fn today() -> Self {
        // In a real app, would use chrono or time crate
        Self { year: 2025, month: 5, day: 6 }
    }
}

impl Display for Date {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{:04}-{:02}-{:02}", self.year, self.month, self.day)
    }
}

// Task struct
#[derive(Debug, Clone)]
struct Task {
    id: u32,
    title: String,
    description: Option<String>,
    priority: Priority,
    status: Status,
    due_date: Option<Date>,
    tags: HashSet<String>,
    created_at: Date,
    updated_at: Date,
}

impl Task {
    fn new(
        id: u32,
        title: String,
        description: Option<String>,
        priority: Priority,
        due_date: Option<Date>,
        tags: HashSet<String>,
    ) -> Self {
        let today = Date::today();
        
        Self {
            id,
            title,
            description,
            priority,
            status: Status::Todo,
            due_date,
            tags,
            created_at: today.clone(),
            updated_at: today,
        }
    }
    
    fn is_overdue(&self) -> bool {
        if let Some(date) = &self.due_date {
            let today = Date::today();
            date < &today && self.status != Status::Completed
        } else {
            false
        }
    }
    
    fn update_status(&mut self, status: Status) {
        self.status = status;
        self.updated_at = Date::today();
    }
}

impl Display for Task {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let description = self.description.clone()
            .unwrap_or_else(|| "None".to_string());
        
        let due_date = match &self.due_date {
            Some(date) => format!("{}", date),
            None => "None".to_string(),
        };
        
        let tags = if self.tags.is_empty() {
            "None".to_string()
        } else {
            self.tags.iter()
                .map(|s| s.as_str())
                .collect::<Vec<_>>()
                .join(", ")
        };
        
        write!(
            f,
            "Task #{}: {}\n  Priority: {}\n  Status: {}\n  Due: {}\n  Tags: {}\n  Description: {}",
            self.id, self.title, self.priority, self.status,
            due_date, tags, description
        )
    }
}

// Task manager trait
trait TaskManager {
    fn add_task(&mut self, task: Task) -> Result<()>;
    fn get_task(&self, id: u32) -> Result<&Task>;
    fn get_task_mut(&mut self, id: u32) -> Result<&mut Task>;
    fn delete_task(&mut self, id: u32) -> Result<Task>;
    fn list_tasks(&self) -> Vec<&Task>;
    fn find_by_status(&self, status: Status) -> Vec<&Task>;
    fn find_by_priority(&self, priority: Priority) -> Vec<&Task>;
    fn find_by_tag(&self, tag: &str) -> Vec<&Task>;
}

// In-memory implementation
struct InMemoryTaskManager {
    tasks: HashMap<u32, Task>,
    next_id: u32,
}

impl InMemoryTaskManager {
    fn new() -> Self {
        Self {
            tasks: HashMap::new(),
            next_id: 1,
        }
    }
    
    fn generate_id(&mut self) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        id
    }
}

impl TaskManager for InMemoryTaskManager {
    fn add_task(&mut self, mut task: Task) -> Result<()> {
        if task.id == 0 {
            task.id = self.generate_id();
        } else if self.tasks.contains_key(&task.id) {
            return Err(TaskError::InvalidInput(format!(
                "Task with ID {} already exists", task.id
            )));
        }
        
        self.tasks.insert(task.id, task);
        Ok(())
    }
    
    fn get_task(&self, id: u32) -> Result<&Task> {
        self.tasks.get(&id).ok_or_else(|| {
            TaskError::NotFound(format!("Task with ID {} not found", id))
        })
    }
    
    fn get_task_mut(&mut self, id: u32) -> Result<&mut Task> {
        self.tasks.get_mut(&id).ok_or_else(|| {
            TaskError::NotFound(format!("Task with ID {} not found", id))
        })
    }
    
    fn delete_task(&mut self, id: u32) -> Result<Task> {
        self.tasks.remove(&id).ok_or_else(|| {
            TaskError::NotFound(format!("Task with ID {} not found", id))
        })
    }
    
    fn list_tasks(&self) -> Vec<&Task> {
        self.tasks.values().collect()
    }
    
    fn find_by_status(&self, status: Status) -> Vec<&Task> {
        self.tasks.values()
            .filter(|task| task.status == status)
            .collect()
    }
    
    fn find_by_priority(&self, priority: Priority) -> Vec<&Task> {
        self.tasks.values()
            .filter(|task| task.priority == priority)
            .collect()
    }
    
    fn find_by_tag(&self, tag: &str) -> Vec<&Task> {
        self.tasks.values()
            .filter(|task| task.tags.contains(tag))
            .collect()
    }
}

// Thread-safe wrapper
struct ThreadSafeTaskManager {
    manager: Arc<Mutex<InMemoryTaskManager>>,
}

impl ThreadSafeTaskManager {
    fn new() -> Self {
        Self {
            manager: Arc::new(Mutex::new(InMemoryTaskManager::new())),
        }
    }
    
    fn clone(&self) -> Self {
        Self {
            manager: Arc::clone(&self.manager),
        }
    }
}

impl TaskManager for ThreadSafeTaskManager {
    fn add_task(&mut self, task: Task) -> Result<()> {
        self.manager
            .lock()
            .map_err(|e| TaskError::StorageError(e.to_string()))?
            .add_task(task)
    }
    
    fn get_task(&self, id: u32) -> Result<&Task> {
        Err(TaskError::StorageError(
            "Cannot borrow from locked manager".to_string()
        ))
    }
    
    fn get_task_mut(&mut self, id: u32) -> Result<&mut Task> {
        Err(TaskError::StorageError(
            "Cannot borrow from locked manager".to_string()
        ))
    }
    
    fn delete_task(&mut self, id: u32) -> Result<Task> {
        self.manager
            .lock()
            .map_err(|e| TaskError::StorageError(e.to_string()))?
            .delete_task(id)
    }
    
    fn list_tasks(&self) -> Vec<&Task> {
        Vec::new() // Cannot borrow from mutex in this implementation
    }
    
    fn find_by_status(&self, _status: Status) -> Vec<&Task> {
        Vec::new() // Cannot borrow from mutex in this implementation
    }
    
    fn find_by_priority(&self, _priority: Priority) -> Vec<&Task> {
        Vec::new() // Cannot borrow from mutex in this implementation
    }
    
    fn find_by_tag(&self, _tag: &str) -> Vec<&Task> {
        Vec::new() // Cannot borrow from mutex in this implementation
    }
}

// Helper function to create a new task
fn create_task(
    title: &str,
    description: Option<&str>,
    priority: Priority,
    due_date: Option<Date>,
    tags: Vec<&str>,
) -> Task {
    let tag_set = tags.into_iter()
        .map(|s| s.to_string())
        .collect::<HashSet<_>>();
    
    let desc = description.map(|s| s.to_string());
    
    Task::new(0, title.to_string(), desc, priority, due_date, tag_set)
}

fn main() -> Result<()> {
    let mut manager = InMemoryTaskManager::new();
    
    // Create a few tasks
    let task1 = create_task(
        "Implement task manager",
        Some("Create a robust task management system in Rust"),
        Priority::High,
        Some(Date::new(2025, 5, 15)?),
        vec!["coding", "rust"],
    );
    
    let task2 = create_task(
        "Test error handling",
        Some("Ensure all error cases are properly handled"),
        Priority::Medium,
        Some(Date::new(2025, 5, 20)?),
        vec!["testing", "rust"],
    );
    
    let task3 = create_task(
        "Document the API",
        Some("Write comprehensive documentation"),
        Priority::Low,
        Some(Date::new(2025, 5, 25)?),
        vec!["docs", "writing"],
    );
    
    // Add tasks to manager
    manager.add_task(task1)?;
    manager.add_task(task2)?;
    manager.add_task(task3)?;
    
    // Display all tasks
    println!("All tasks:");
    for task in manager.list_tasks() {
        println!("{}\n", task);
    }
    
    // Update a task status
    let task = manager.get_task_mut(1)?;
    task.update_status(Status::InProgress);
    println!("Updated task 1 status:");
    println!("{}\n", task);
    
    // Find tasks by status
    println!("Tasks in progress:");
    for task in manager.find_by_status(Status::InProgress) {
        println!("{}\n", task);
    }
    
    // Find tasks by tag
    println!("Tasks with 'rust' tag:");
    for task in manager.find_by_tag("rust") {
        println!("{}\n", task);
    }
    
    // Delete a task
    let removed = manager.delete_task(2)?;
    println!("Removed task: {}\n", removed);
    
    // Final task list
    println!("Final task list:");
    for task in manager.list_tasks() {
        println!("{}\n", task);
    }
    
    // Demonstrate closures and iterators
    let high_priority_count = manager.list_tasks()
        .iter()
        .filter(|task| task.priority == Priority::High)
        .count();
    
    println!("Number of high priority tasks: {}", high_priority_count);
    
    // Map-reduce pattern to count tasks by status
    let status_counts = manager.list_tasks()
        .iter()
        .fold(
            HashMap::new(),
            |mut acc, task| {
                *acc.entry(task.status).or_insert(0) += 1;
                acc
            }
        );
    
    println!("Task counts by status:");
    for (status, count) in status_counts {
        println!("  {}: {}", status, count);
    }
    
    Ok(())
}`;
