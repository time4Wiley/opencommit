class Opencommit < Formula
  desc "GPT CLI to auto-generate impressive commits in 1 second (fork with -hb suffix)"
  homepage "https://github.com/time4Wiley/opencommit"
  url "https://github.com/time4Wiley/opencommit/archive/refs/tags/v2.0.0.tar.gz"
  version "2.0.0"
  sha256 "PLACEHOLDER_SHA256"
  license "MIT"

  depends_on "node@18"

  def install
    system "npm", "install", "--production"
    system "npm", "run", "build-homebrew"
    
    # Install the main executable with -hb suffix
    bin.install "out/cli.cjs" => "opencommit-hb"
    
    # Create symlinks for the aliases with -hb suffix
    bin.install_symlink "opencommit-hb" => "oc-hb"
    bin.install_symlink "opencommit-hb" => "oco-hb"
    
    # Install the wasm file where the executable can find it
    bin.install "out/tiktoken_bg.wasm"
    # Also install in lib for completeness
    lib.install "out/tiktoken_bg.wasm"
  end

  test do
    # Test basic functionality
    system "#{bin}/opencommit-hb", "--version"
    system "#{bin}/oc-hb", "--version"
    system "#{bin}/oco-hb", "--version"
  end
end 