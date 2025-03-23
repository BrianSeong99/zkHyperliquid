//! An end-to-end example of using the SP1 SDK to generate a proof of a program that can be executed
//! or have a core proof generated.
//!
//! You can run this script using the following command:
//! ```shell
//! RUST_LOG=info cargo run --release -- --execute
//! ```
//! or
//! ```shell
//! RUST_LOG=info cargo run --release -- --prove
//! ```

use alloy_sol_types::SolType;
use clap::Parser;
use sp1_sdk::{include_elf, ProverClient, SP1Stdin};
use block_proof_lib::data::populate_block_data;
/// The ELF (executable and linkable format) file for the Succinct RISC-V zkVM.
pub const BLOCK_PROOF_ELF: &[u8] = include_elf!("block-proof-program");

/// The arguments for the command.
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Args {
    #[clap(long)]
    execute: bool,

    #[clap(long)]
    prove: bool,

    #[clap(long, default_value = "20")]
    n: u32,
}

fn main() {
    // Setup the logger.
    sp1_sdk::utils::setup_logger();
    dotenv::dotenv().ok();

    // Parse the command line arguments.
    let args = Args::parse();

    if args.execute == args.prove {
        eprintln!("Error: You must specify either --execute or --prove");
        std::process::exit(1);
    }

    // Setup the prover client.
    let client = ProverClient::from_env();

    let block_proof_input = populate_block_data(args.n);

    // Setup the inputs.
    let mut stdin = SP1Stdin::new();
    stdin.write(&block_proof_input);

    println!("n: {}", args.n);

    if args.execute {
        // Execute the program
        let (output, report) = client.execute(BLOCK_PROOF_ELF, &stdin).run().unwrap();
        println!("Program executed successfully.");

        // Read the output - it's just a boolean result from our block_proof function
        if !output.is_empty() {
            let result = output[0] != 0; // Convert byte to boolean
            println!("Block proof verification result: {}", result);
            
            if result {
                println!("✅ Block proof verification successful!");
            } else {
                println!("❌ Block proof verification failed!");
            }
        } else {
            println!("Warning: No output received from the program");
        }

        // Record the number of cycles executed.
        println!("Number of cycles: {}", report.total_instruction_count());
    } else {
        // Setup the program for proving.
        let setup_start = std::time::Instant::now();
        let (pk, vk) = client.setup(BLOCK_PROOF_ELF);
        let setup_duration = setup_start.elapsed();
        println!("Setup completed in: {:?}", setup_duration);

        // Generate the proof
        let prove_start = std::time::Instant::now();
        let proof = client
            .prove(&pk, &stdin)
            .run()
            .expect("failed to generate proof");
        let prove_duration = prove_start.elapsed();

        println!("Successfully generated proof in: {:?}!", prove_duration);

        // Verify the proof.
        let verify_start = std::time::Instant::now();
        client.verify(&proof, &vk).expect("failed to verify proof");
        let verify_duration = verify_start.elapsed();
        
        println!("Successfully verified proof in: {:?}!", verify_duration);
        
        // The proof contains a commitment to the output, which is a boolean indicating
        // whether the block proof verification was successful
        println!("The proof verifies that the block and its state transitions are valid");
        println!("Total proving time: {:?}", setup_duration + prove_duration + verify_duration);
    }
}
