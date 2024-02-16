{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devenv.url = "github:cachix/devenv";
    dagger.url = "github:dagger/nix/d74bfdc29cfa2d89c02f0c5ba2f76c2608fe582b"; # pin to 0.9.7
    dagger.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devenv.flakeModule
      ];

      systems = [ "x86_64-linux" "x86_64-darwin" "aarch64-darwin" ];

      perSystem = { config, self', inputs', pkgs, system, ... }: rec {
        _module.args.pkgs = import inputs.nixpkgs {
          inherit system;

          overlays = [
            (final: prev: {
              dagger = inputs'.dagger.packages.dagger;
            })
          ];
        };

        devenv.shells = {
          default = {
            packages = with pkgs; [
              # node
              yarn
             ];

            env.GREET = "world";

            languages = {
              javascript = {
                enable = true;
                package = pkgs.nodejs_20;
              };
            };

            scripts.hello.exec = "echo hello from $GREET";
            scripts.prettier-check.exec = "${pkgs.yarn}/bin/yarn prettier:check";
            scripts.tsc-check.exec = "${pkgs.yarn}/bin/yarn typescript:check";
            scripts.lint-check.exec = "${pkgs.yarn}/bin/yarn lint";

            enterShell = ''
              hello
              git --version
              export PATH=node_modules/.bin:$PATH
            '';

            pre-commit.hooks = {
              prettier-check = {
                enable = true;
                name = "prettier check";
                raw.always_run = true;
                entry = "prettier-check";
              };

              typescript-check = {
                enable = true;
                name = "typescript check";
                raw.always_run = true;
                entry = "tsc-check";
              };

              lint-check = {
                enable = true;
                name = "eslint check";
                raw.always_run = true;
                entry = "lint-check";
              };
            };
          };

          ci = devenv.shells.default;
        };
      };
    };
}
