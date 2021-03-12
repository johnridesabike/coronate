open Jest
open ReactTestingLibrary
open JestDom

let date = Js.Date.fromString("2000-01-01T13:55:02.573Z")

test("Date format component works", () =>
  render(<Utils.DateFormat date />)
  |> getByText(~matcher=#Str("Jan 01, 2000"))
  |> expect
  |> toBeInTheDocument
)

test("Date + time format component works", () =>
  render(<Utils.DateTimeFormat date timeZone="America/New_York" />)
  |> getByText(~matcher=#Str("Jan 01, 2000, 08:55 AM"))
  |> expect
  |> toBeInTheDocument
)
