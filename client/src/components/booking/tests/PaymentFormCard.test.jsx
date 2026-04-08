import { render, screen, fireEvent } from "@testing-library/react";
import PaymentFormCard from "../PaymentFormCard";

describe("PaymentFormCard", () => {
  test("renders form and submits payment", () => {
    const handlePayment = jest.fn((event) => event.preventDefault());
    const setCardBrand = jest.fn();
    const setCardType = jest.fn();
    const setFirstName = jest.fn();
    const setLastName = jest.fn();
    const setCardNumber = jest.fn();
    const setExpiryDate = jest.fn();
    const setCvv = jest.fn();

    render(
      <PaymentFormCard
        handlePayment={handlePayment}
        paymentOptions={[{ id: "visa", icon: "/visa.png", label: "Visa" }]}
        actionsLocked={false}
        cardBrand="visa"
        setCardBrand={setCardBrand}
        cardType="credit"
        setCardType={setCardType}
        firstName="Jane"
        setFirstName={setFirstName}
        lastName="Doe"
        setLastName={setLastName}
        cardNumber="1234 5678 9012 3456"
        setCardNumber={setCardNumber}
        expiryDate="12/30"
        setExpiryDate={setExpiryDate}
        cvv="123"
        setCvv={setCvv}
        processing={false}
        cancellingBooking={false}
        bookingData={{ totalPrice: 3000 }}
        paymentError=""
        onBackEdit={jest.fn()}
        onCancelBooking={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /pay now/i }));
    expect(handlePayment).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /visa/i }));
    expect(setCardBrand).toHaveBeenCalledWith("visa");
  });
});
