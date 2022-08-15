import maskpass

pwd = maskpass.askpass(prompt="Password:", mask="#")
print(pwd)