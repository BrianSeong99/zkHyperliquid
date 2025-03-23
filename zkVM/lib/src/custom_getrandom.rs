//! Custom implementation of getrandom for SP1 zkVM

/// This is a custom implementation of the getrandom crate's fill_bytes function
/// that provides deterministic "random" bytes for the zkVM environment.
#[cfg(feature = "custom")]
pub fn getrandom_custom_impl(dest: &mut [u8]) -> Result<(), getrandom::Error> {
    // Fill the buffer with a deterministic pattern
    for (i, byte) in dest.iter_mut().enumerate() {
        *byte = (i % 256) as u8;
    }
    Ok(())
}

// Register our custom implementation
#[cfg(feature = "custom")]
getrandom::register_custom_getrandom!(getrandom_custom_impl); 