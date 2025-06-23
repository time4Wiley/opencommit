class Opencommit < Formula
  desc "GPT CLI to auto-generate impressive commits in 1 second"
  homepage "https://github.com/di-sukharev/opencommit"
  url "https://github.com/di-sukharev/opencommit/archive/refs/tags/v2.0.0.tar.gz"
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
    
    # Install the wasm file
    lib.install "out/tiktoken_bg.wasm"
  end

  test do
    # Test basic functionality
    system "#{bin}/opencommit-hb", "--version"
    system "#{bin}/oc-hb", "--version"
    system "#{bin}/oco-hb", "--version"
  end
end 