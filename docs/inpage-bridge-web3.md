**Instructions to Obtain InpageBridgeWeb3.js from MetaMask's mobile-provider**

1. **Clone the Repository**

   - Open your terminal or command prompt.
   - Enter the following command to clone the MetaMask mobile-provider repository:
     ```
     git clone https://github.com/MetaMask/mobile-provider.git
     ```

2. **Navigate to the Directory**

   - Change into the directory of the cloned repository:
     ```
     cd mobile-provider
     ```

3. **Build the Package**

   - Depending on the build process used by the repository (usually mentioned in the README or package.json file), you might need to run a build command. Commonly for JavaScript projects, this might be:
     ```
     yarn && yarn build
     ```

4. **Сopy the Script to React Native Project**

- If you're working on an **Android** project, you should copy `InpageBridgeWeb3.js` to the `android/app/src/main/assets/custom` directory of your React Native project.
- For **iOS**, copy `InpageBridgeWeb3.j`s to the main bundle path of your React Native project.
