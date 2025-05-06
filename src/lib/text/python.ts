export const python = `def calculate_sequences():
    """Practice typing Python with lots of brackets."""
    # Create some lists using comprehensions
    squares = [x**2 for x in range(1, 11)]
    cubes = [x**3 for x in range(1, 11)]
    
    # Nested list operations
    matrix = [[i+j for j in range(5)] for i in range(5)]
    transpose = [[row[i] for row in matrix] for i in range(5)]
    
    # Function with multiple return values using tuples
    def stats(numbers):
        if not numbers:
            return (0, 0, 0)
        avg = sum(numbers) / len(numbers)
        minimum = min(numbers)
        maximum = max(numbers)
        return (avg, minimum, maximum)
    
    # Unpacking in assignments
    mean, min_val, max_val = stats(squares)
    
    # Conditional expressions with parentheses
    is_even = [(x, "Even" if x % 2 == 0 else "Odd") for x in range(10)]
    
    # Function with default parameters and type hints
    def filter_values(values, predicate=lambda x: x > 0):
        return [x for x in values if predicate(x)]
    
    # Nested function calls
    result = filter_values(
        [x**2 - 5*x + 6 for x in range(-10, 11)],
        lambda x: x > 0 and x < 50
    )
    
    # String formatting with f-strings and expressions
    output = [
        f"Item {i}: {val} ({'even' if val % 2 == 0 else 'odd'})"
        for i, val in enumerate(result)
    ]
    
    return output


class BinaryTree:
    def __init__(self, value=None):
        self.value = value
        self.left = None
        self.right = None
    
    def insert(self, value):
        if self.value is None:
            self.value = value
            return
        
        if value < self.value:
            if self.left is None:
                self.left = BinaryTree(value)
            else:
                self.left.insert(value)
        else:
            if self.right is None:
                self.right = BinaryTree(value)
            else:
                self.right.insert(value)
    
    def inorder_traversal(self):
        result = []
        if self.left:
            result.extend(self.left.inorder_traversal())
        if self.value is not None:
            result.append(self.value)
        if self.right:
            result.extend(self.right.inorder_traversal())
        return result
    
    def search(self, value):
        if self.value == value:
            return True
        if value < self.value and self.left:
            return self.left.search(value)
        if value > self.value and self.right:
            return self.right.search(value)
        return False


def recursive_algorithms():
    # Recursive factorial function
    def factorial(n):
        return 1 if n <= 1 else n * factorial(n-1)
    
    # Recursive Fibonacci function with memoization
    memo = {}
    def fibonacci(n):
        if n in memo:
            return memo[n]
        if n <= 1:
            result = n
        else:
            result = fibonacci(n-1) + fibonacci(n-2)
        memo[n] = result
        return result
    
    # Function to generate permutations recursively
    def permutations(items):
        if len(items) <= 1:
            return [items]
        result = []
        for i in range(len(items)):
            current = items[i]
            remaining = items[:i] + items[i+1:]
            for p in permutations(remaining):
                result.append([current] + p)
        return result
    
    # Testing the functions
    fac_results = [factorial(i) for i in range(10)]
    fib_results = [fibonacci(i) for i in range(15)]
    perm_results = permutations([1, 2, 3])
    
    return (fac_results, fib_results, perm_results)


if __name__ == "__main__":
    # Create a binary search tree
    tree = BinaryTree()
    for value in [50, 30, 70, 20, 40, 60, 80]:
        tree.insert(value)
    
    # Get the sorted values
    sorted_values = tree.inorder_traversal()
    print(f"Sorted values: {sorted_values}")
    
    # Sequence calculations
    sequence_output = calculate_sequences()
    print(f"Generated sequences: {len(sequence_output)} items")
    
    # Recursive algorithm results
    fac, fib, perm = recursive_algorithms()
    print(f"Factorial of 5: {fac[5]}")
    print(f"Fibonacci of 10: {fib[10]}")
    print(f"Permutations of [1,2,3]: {len(perm)} arrangements")`.replaceAll('    ', '\t');
