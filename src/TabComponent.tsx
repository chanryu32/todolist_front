import React, { useState, useEffect } from "react";
import "./App.css";
import { MdDeleteForever } from "./react-icons/md";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

function TabComponent() {
  type TodoItem = {
    id?: string;
    categoryId: string;
    inputValue: string;
    isCompleted: boolean;
    LastUpdatedOn?: Date;
    CreatedOn?: Date;
  };

  type Category = {
    id?: string;
    name: string;
    CreatedOn?: Date;
    todoItems?: TodoItem[];
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [categoryId, setCategoryId] = useState("");

  //画面初期表示処理
  //第2引数に空配列を指定することで無限ループを回避する
  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = () => {
    fetch("https://localhost:7283/api/categories")
      .then((response) => response.json())
      .then((json) => {
        const categories: Category[] = JSON.parse(JSON.stringify(json));

        setCategories(categories);
        setCategoryId(categories[0]?.id ?? "");
        setTodoItems(categories[0]?.todoItems ?? []);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //リロード回避
    e.preventDefault();

    setInputValue("");

    //新しいTODOを作成
    const newTodoItems: TodoItem = {
      categoryId: categoryId,
      inputValue: inputValue,
      isCompleted: false,
    };

    todoItems.push(newTodoItems);

    //...←スプレッド構文
    setTodoItems([...todoItems]);

    fetch("https://localhost:7283/api/TodoItems/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodoItems),
    });
  };

  const handleEdit = (id: string, inputValue: string) => {
    let target: TodoItem | null = null;

    const newTodos = todoItems.map((todo) => {
      if (todo.id === id) {
        todo.inputValue = inputValue;
        target = todo;
      }
      return todo;
    });

    setTodoItems(newTodos);

    fetch("https://localhost:7283/api/TodoItems/" + id, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(target),
    });
  };

  const handleChecked = (id: string, isCompleted: boolean) => {
    let target: TodoItem | null = null;

    const newTodos = todoItems.map((todo) => {
      if (todo.id === id) {
        todo.isCompleted = isCompleted;
        target = todo;
      }
      return todo;
    });

    setTodoItems(newTodos);

    fetch("https://localhost:7283/api/TodoItems/" + id, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(target),
    });
  };

  const handleDelete = (id: string) => {
    const newTodos = todoItems.filter((todo) => todo.id !== id);

    setTodoItems(newTodos);
    fetch("https://localhost:7283/api/TodoItems/" + id, {
      method: "DELETE",
    });
  };

  const categoryChanged = (index: number) => {
    setCategoryId(categories[index].id ?? "");
    setTodoItems(categories[index].todoItems ?? []);
  };

  return (
    <Tabs onSelect={(index) => categoryChanged(index)}>
      <TabList>
        {categories.map((category) => (
          <Tab>{category.name}</Tab>
        ))}
      </TabList>
      {categories.map((category) => (
        <TabPanel>
          <div className="todoList">
            <form onSubmit={(e) => handleSubmit(e)}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleChange(e)}
                className="inputText"
              />
              <input type="submit" value="追加" className="submitButton" />
            </form>
            <ul className="todos">
              {todoItems.map((todo) => (
                <li key={todo.id}>
                  <input
                    type="text"
                    onChange={(e) => handleEdit(todo.id ?? "", e.target.value)}
                    className="inputText"
                    value={todo.inputValue}
                    disabled={todo.isCompleted}
                  />
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleChecked(todo.id ?? "", e.target.checked)
                    }
                    className="checkBox"
                    checked={todo.isCompleted}
                  />
                  <button
                    onClick={(e) => handleDelete(todo.id ?? "")}
                    className="deleteButton"
                  >
                    <MdDeleteForever size={25} color={"gray"} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </TabPanel>
      ))}
    </Tabs>
  );
}

export default TabComponent;
