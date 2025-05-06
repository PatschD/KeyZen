export const c = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

#define MAX_ITEMS 100
#define BUFFER_SIZE 256
#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#define IS_EVEN(x) ((x) % 2 == 0)
#define SWAP(x, y, T) do { T temp = x; x = y; y = temp; } while(0)

// Type definitions and structs
typedef enum {
    NONE = 0,
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4
} Priority;

typedef struct {
    int day;
    int month;
    int year;
} Date;

typedef struct {
    char title[64];
    char description[256];
    Date due_date;
    Priority priority;
    bool completed;
} Task;

typedef struct Node {
    Task data;
    struct Node* next;
} Node;

typedef struct {
    Node* head;
    Node* tail;
    int size;
} TaskList;

// Function prototypes
void init_task_list(TaskList* list);
bool add_task(TaskList* list, Task task);
bool remove_task(TaskList* list, const char* title);
Task* find_task(TaskList* list, const char* title);
void sort_tasks(TaskList* list, 
                bool (*compare)(Task*, Task*));
void print_task(Task* task);
void print_all_tasks(TaskList* list);
void free_task_list(TaskList* list);
bool compare_by_priority(Task* a, Task* b);
bool compare_by_date(Task* a, Task* b);
Date create_date(int day, int month, int year);
int date_compare(Date* a, Date* b);

// Function implementations
void init_task_list(TaskList* list) {
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
}

bool add_task(TaskList* list, Task task) {
    Node* new_node = (Node*)malloc(sizeof(Node));
    if (new_node == NULL) {
        return false;
    }
    
    new_node->data = task;
    new_node->next = NULL;
    
    if (list->head == NULL) {
        list->head = new_node;
        list->tail = new_node;
    } else {
        list->tail->next = new_node;
        list->tail = new_node;
    }
    
    list->size++;
    return true;
}

bool remove_task(TaskList* list, const char* title) {
    if (list->head == NULL) {
        return false;
    }
    
    Node* current = list->head;
    Node* previous = NULL;
    
    while (current != NULL) {
        if (strcmp(current->data.title, title) == 0) {
            // Found the task to remove
            if (previous == NULL) {
                // Removing the head
                list->head = current->next;
                if (list->head == NULL) {
                    list->tail = NULL;
                }
            } else {
                previous->next = current->next;
                if (current->next == NULL) {
                    list->tail = previous;
                }
            }
            
            free(current);
            list->size--;
            return true;
        }
        
        previous = current;
        current = current->next;
    }
    
    return false;
}

Task* find_task(TaskList* list, const char* title) {
    Node* current = list->head;
    
    while (current != NULL) {
        if (strcmp(current->data.title, title) == 0) {
            return &(current->data);
        }
        current = current->next;
    }
    
    return NULL;
}

void sort_tasks(TaskList* list, bool (*compare)(Task*, Task*)) {
    if (list->size <= 1) {
        return;
    }
    
    bool swapped;
    Node* current;
    Node* last = NULL;
    
    do {
        swapped = false;
        current = list->head;
        
        while (current->next != last) {
            if (compare(&(current->data), &(current->next->data))) {
                // Swap tasks
                Task temp = current->data;
                current->data = current->next->data;
                current->next->data = temp;
                swapped = true;
            }
            current = current->next;
        }
        last = current;
    } while (swapped);
}

void print_task(Task* task) {
    if (task == NULL) {
        printf("Task is NULL\n");
        return;
    }
    
    const char* priority_str[] = {
        "None", "Low", "Medium", "High", "Critical"
    };
    
    printf("Title: %s\n", task->title);
    printf("Description: %s\n", task->description);
    printf("Due Date: %02d/%02d/%04d\n", 
           task->due_date.day, 
           task->due_date.month, 
           task->due_date.year);
    printf("Priority: %s\n", priority_str[task->priority]);
    printf("Status: %s\n", 
           task->completed ? "Completed" : "Pending");
    printf("------------------------\n");
}

void print_all_tasks(TaskList* list) {
    if (list->size == 0) {
        printf("No tasks found.\n");
        return;
    }
    
    printf("\n===== Task List (%d items) =====\n", list->size);
    
    Node* current = list->head;
    int i = 1;
    
    while (current != NULL) {
        printf("\n--- Task %d ---\n", i++);
        print_task(&(current->data));
        current = current->next;
    }
}

void free_task_list(TaskList* list) {
    Node* current = list->head;
    Node* next;
    
    while (current != NULL) {
        next = current->next;
        free(current);
        current = next;
    }
    
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
}

bool compare_by_priority(Task* a, Task* b) {
    return a->priority < b->priority;
}

bool compare_by_date(Task* a, Task* b) {
    return date_compare(&(a->due_date), &(b->due_date)) > 0;
}

Date create_date(int day, int month, int year) {
    Date date = {
        .day = day,
        .month = month,
        .year = year
    };
    return date;
}

int date_compare(Date* a, Date* b) {
    if (a->year != b->year) {
        return a->year - b->year;
    }
    if (a->month != b->month) {
        return a->month - b->month;
    }
    return a->day - b->day;
}

int main() {
    // Seed random number generator
    srand((unsigned int)time(NULL));
    
    // Initialize task list
    TaskList task_list;
    init_task_list(&task_list);
    
    // Create and add sample tasks
    Task tasks[] = {
        {
            .title = "Complete project proposal",
            .description = "Draft and finalize the project proposal",
            .due_date = {15, 5, 2025},
            .priority = HIGH,
            .completed = false
        },
        {
            .title = "Debug memory leak",
            .description = "Identify and fix memory leaks in module X",
            .due_date = {10, 5, 2025},
            .priority = CRITICAL,
            .completed = false
        },
        {
            .title = "Update documentation",
            .description = "Update API documentation with new features",
            .due_date = {20, 5, 2025},
            .priority = MEDIUM,
            .completed = true
        }
    };
    
    // Add tasks to the list
    for (int i = 0; i < 3; i++) {
        if (!add_task(&task_list, tasks[i])) {
            printf("Failed to add task: %s\n", tasks[i].title);
        }
    }
    
    // Generate random tasks
    char buffer[64];
    for (int i = 0; i < 5; i++) {
        Task new_task;
        sprintf(buffer, "Random Task %d", i + 1);
        strcpy(new_task.title, buffer);
        
        sprintf(buffer, "Description for random task %d", i + 1);
        strcpy(new_task.description, buffer);
        
        new_task.due_date.day = 1 + rand() % 28;
        new_task.due_date.month = 1 + rand() % 12;
        new_task.due_date.year = 2025;
        
        new_task.priority = (Priority)(1 + rand() % 4);
        new_task.completed = rand() % 2 == 0;
        
        add_task(&task_list, new_task);
    }
    
    // Print all tasks
    printf("Original task list:\n");
    print_all_tasks(&task_list);
    
    // Sort by priority and print again
    printf("\nTask list sorted by priority:\n");
    sort_tasks(&task_list, compare_by_priority);
    print_all_tasks(&task_list);
    
    // Sort by date and print again
    printf("\nTask list sorted by due date:\n");
    sort_tasks(&task_list, compare_by_date);
    print_all_tasks(&task_list);
    
    // Find and print a specific task
    printf("\nSearching for task 'Debug memory leak':\n");
    Task* found = find_task(&task_list, "Debug memory leak");
    if (found != NULL) {
        print_task(found);
        
        // Modify the found task
        found->completed = true;
        printf("Task marked as completed:\n");
        print_task(found);
    } else {
        printf("Task not found.\n");
    }
    
    // Remove a task
    printf("\nRemoving task 'Update documentation'...\n");
    if (remove_task(&task_list, "Update documentation")) {
        printf("Task removed successfully.\n");
    } else {
        printf("Failed to remove task.\n");
    }
    
    // Print final task list
    printf("\nFinal task list:\n");
    print_all_tasks(&task_list);
    
    // Clean up
    free_task_list(&task_list);
    printf("\nTask list freed successfully.\n");
    
    return 0;
}`;
