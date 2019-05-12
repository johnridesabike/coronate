// This stops @reach packages from nagging us about adding their styles.
window.getComputedStyle = jest.fn().mockImplementation( () => ({
    getPropertyValue: () => 1
}));
