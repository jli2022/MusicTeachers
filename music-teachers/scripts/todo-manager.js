#!/usr/bin/env node

/**
 * TODO Manager Script
 * 
 * This script helps manage the TODO.md file and sync it with GitHub Issues.
 * 
 * Usage:
 *   node scripts/todo-manager.js [command] [options]
 * 
 * Commands:
 *   - list: List all TODO items with their status
 *   - check <item>: Mark an item as completed
 *   - uncheck <item>: Mark an item as incomplete
 *   - add <category> <item>: Add a new item to a category
 *   - sync: Sync with GitHub Issues (requires GITHUB_TOKEN)
 */

const fs = require('fs');
const path = require('path');

const TODO_FILE = path.join(__dirname, '..', 'TODO.md');

class TodoManager {
  constructor() {
    this.todoContent = '';
    this.loadTodo();
  }

  loadTodo() {
    try {
      this.todoContent = fs.readFileSync(TODO_FILE, 'utf8');
    } catch (error) {
      console.error('Error reading TODO.md:', error.message);
      process.exit(1);
    }
  }

  saveTodo() {
    try {
      fs.writeFileSync(TODO_FILE, this.todoContent);
      console.log('✅ TODO.md updated successfully');
    } catch (error) {
      console.error('Error writing TODO.md:', error.message);
      process.exit(1);
    }
  }

  listItems() {
    const lines = this.todoContent.split('\n');
    let currentCategory = '';
    const items = [];

    lines.forEach((line, index) => {
      // Detect categories
      if (line.startsWith('### ') || line.startsWith('## ')) {
        currentCategory = line.replace(/^#+ /, '');
      }
      
      // Detect TODO items
      if (line.match(/^- \[ \]/) || line.match(/^- \[x\]/)) {
        const isCompleted = line.includes('[x]') || line.includes('✅');
        const item = line.replace(/^- \[[x ]\] /, '').replace(/^\*\*(.*?)\*\* - /, '$1: ');
        
        items.push({
          line: index + 1,
          category: currentCategory,
          item: item,
          completed: isCompleted,
          raw: line
        });
      }
    });

    return items;
  }

  showList() {
    const items = this.listItems();
    const categories = {};

    // Group by category
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    console.log('\n📋 TODO Items by Category:\n');

    Object.entries(categories).forEach(([category, categoryItems]) => {
      console.log(`\n🏷️  ${category}`);
      console.log('─'.repeat(50));
      
      categoryItems.forEach(item => {
        const status = item.completed ? '✅' : '❌';
        console.log(`${status} [Line ${item.line}] ${item.item}`);
      });
    });

    const completed = items.filter(item => item.completed).length;
    const total = items.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    console.log(`\n📊 Progress: ${completed}/${total} completed (${percentage}%)\n`);
  }

  markCompleted(searchTerm) {
    const items = this.listItems();
    const matchingItems = items.filter(item => 
      item.item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchingItems.length === 0) {
      console.log(`❌ No TODO items found matching: "${searchTerm}"`);
      return;
    }

    if (matchingItems.length > 1) {
      console.log(`⚠️  Multiple items found matching "${searchTerm}":`);
      matchingItems.forEach((item, index) => {
        console.log(`${index + 1}. [Line ${item.line}] ${item.item}`);
      });
      console.log('\nPlease be more specific with your search term.');
      return;
    }

    const item = matchingItems[0];
    const lines = this.todoContent.split('\n');
    
    // Replace the line
    if (item.completed) {
      console.log(`ℹ️  Item is already completed: ${item.item}`);
      return;
    }

    lines[item.line - 1] = lines[item.line - 1].replace('- [ ]', '- [x]');
    this.todoContent = lines.join('\n');
    this.saveTodo();
    
    console.log(`✅ Marked as completed: ${item.item}`);
  }

  markIncomplete(searchTerm) {
    const items = this.listItems();
    const matchingItems = items.filter(item => 
      item.item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchingItems.length === 0) {
      console.log(`❌ No TODO items found matching: "${searchTerm}"`);
      return;
    }

    if (matchingItems.length > 1) {
      console.log(`⚠️  Multiple items found matching "${searchTerm}":`);
      matchingItems.forEach((item, index) => {
        console.log(`${index + 1}. [Line ${item.line}] ${item.item}`);
      });
      console.log('\nPlease be more specific with your search term.');
      return;
    }

    const item = matchingItems[0];
    const lines = this.todoContent.split('\n');
    
    // Replace the line
    if (!item.completed) {
      console.log(`ℹ️  Item is already incomplete: ${item.item}`);
      return;
    }

    lines[item.line - 1] = lines[item.line - 1].replace('- [x]', '- [ ]');
    this.todoContent = lines.join('\n');
    this.saveTodo();
    
    console.log(`📝 Marked as incomplete: ${item.item}`);
  }

  addItem(category, itemText) {
    const lines = this.todoContent.split('\n');
    let categoryIndex = -1;

    // Find the category section
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(category)) {
        categoryIndex = i;
        break;
      }
    }

    if (categoryIndex === -1) {
      console.log(`❌ Category "${category}" not found in TODO.md`);
      console.log('Available categories:');
      lines.forEach((line, index) => {
        if (line.startsWith('### ') || line.startsWith('## ')) {
          console.log(`  - ${line.replace(/^#+ /, '')}`);
        }
      });
      return;
    }

    // Find where to insert the new item (after the category heading)
    let insertIndex = categoryIndex + 1;
    while (insertIndex < lines.length && !lines[insertIndex].startsWith('- [ ]')) {
      insertIndex++;
    }

    // Insert the new item
    const newItem = `- [ ] ${itemText}`;
    lines.splice(insertIndex, 0, newItem);
    
    this.todoContent = lines.join('\n');
    this.saveTodo();
    
    console.log(`✅ Added new item to "${category}": ${itemText}`);
  }

  showHelp() {
    console.log(`
📋 TODO Manager Help

Commands:
  list                    List all TODO items with their status
  check <search-term>     Mark an item as completed
  uncheck <search-term>   Mark an item as incomplete  
  add <category> <item>   Add a new item to a category
  help                    Show this help message

Examples:
  node scripts/todo-manager.js list
  node scripts/todo-manager.js check "Google OAuth"
  node scripts/todo-manager.js add "High Priority" "New feature request"
  node scripts/todo-manager.js uncheck "Email notifications"

Notes:
  - Search terms are case-insensitive and use partial matching
  - Category names should match those in TODO.md (e.g., "High Priority", "Medium Priority")
  - Use quotes around multi-word search terms or item descriptions
`);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const todoManager = new TodoManager();

  switch (command) {
    case 'list':
      todoManager.showList();
      break;
      
    case 'check':
      if (args.length < 2) {
        console.log('❌ Please provide a search term. Usage: check <search-term>');
        return;
      }
      todoManager.markCompleted(args.slice(1).join(' '));
      break;
      
    case 'uncheck':
      if (args.length < 2) {
        console.log('❌ Please provide a search term. Usage: uncheck <search-term>');
        return;
      }
      todoManager.markIncomplete(args.slice(1).join(' '));
      break;
      
    case 'add':
      if (args.length < 3) {
        console.log('❌ Please provide a category and item. Usage: add <category> <item>');
        return;
      }
      todoManager.addItem(args[1], args.slice(2).join(' '));
      break;
      
    case 'help':
    case '--help':
    case '-h':
      todoManager.showHelp();
      break;
      
    default:
      console.log('❌ Unknown command. Use "help" to see available commands.');
      todoManager.showHelp();
  }
}

if (require.main === module) {
  main();
}

module.exports = TodoManager;