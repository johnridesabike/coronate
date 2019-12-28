open Jest;
open Expect;
open ReactTestingLibrary;
open JestDom;
open Utils;

let date = Js.Date.fromString("2000-01-01T13:55:02.573Z");

test("Date format component works", () =>
  render(<DateFormat date />)
  ->getByText(~matcher=`Str("Jan 01, 2000"))
  ->expect
  ->toBeInTheDocument
);

test("Date + time format component works", () =>
  render(<DateTimeFormat date />)
  ->getByText(~matcher=`Str("Jan 01, 2000, 08:55 AM"))
  ->expect
  ->toBeInTheDocument
);