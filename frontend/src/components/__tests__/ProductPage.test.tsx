import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import ProductPage from "../../app/products/page";
import "@testing-library/jest-dom";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

describe("ProductPage", () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
  });

  it("renders product management page", () => {
    render(<ProductPage />);
    expect(screen.getByText("商品情報管理")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/商品情報を入力してください/),
    ).toBeInTheDocument();
    expect(screen.getByText("保存")).toBeInTheDocument();
  });

  it("handles product entry submission", async () => {
    render(<ProductPage />);

    const textarea = screen.getByPlaceholderText(/商品情報を入力してください/);
    const submitButton = screen.getByText("保存");

    await act(async () => {
      fireEvent.change(textarea, { target: { value: "テスト商品情報" } });
      fireEvent.click(submitButton);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(textarea).toHaveValue("");
  });
});
