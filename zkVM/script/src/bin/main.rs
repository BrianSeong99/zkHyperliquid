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

        // Read the output.
        let decoded = PublicValuesStruct::abi_decode(output.as_slice(), true).unwrap();
        let PublicValuesStruct { n, a, b } = decoded;
        println!("n: {}", n);
        println!("a: {}", a);
        println!("b: {}", b);

        let (expected_a, expected_b) = fibonacci_lib::fibonacci(n);
        assert_eq!(a, expected_a);
        assert_eq!(b, expected_b);
        println!("Values are correct!");

        // Record the number of cycles executed.
        println!("Number of cycles: {}", report.total_instruction_count());
    } else {
        // Setup the program for proving.
        let (pk, vk) = client.setup(BLOCK_PROOF_ELF);

        // Generate the proof
        let proof = client
            .prove(&pk, &stdin)
            .run()
            .expect("failed to generate proof");

        println!("Successfully generated proof!");

        // Verify the proof.
        client.verify(&proof, &vk).expect("failed to verify proof");
        println!("Successfully verified proof!");
    }
}
