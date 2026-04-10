#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec,
};

// Job structure
#[derive(Clone)]
#[contracttype]
pub struct Job {
    pub id: u64,
    pub employer: Address,
    pub title: String,
    pub description: String,
    pub is_open: bool,
}

// Storage keys
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Job(u64),
    JobList,
}

#[contract]
pub struct JobMarketplace;

#[contractimpl]
impl JobMarketplace {

    // Post a job
    pub fn post_job(
        env: Env,
        employer: Address,
        id: u64,
        title: String,
        description: String,
    ) {
        employer.require_auth();

        let job = Job {
            id,
            employer: employer.clone(),
            title,
            description,
            is_open: true,
        };

        // Save job
        env.storage().instance().set(&DataKey::Job(id), &job);

        // Maintain job list
        let mut jobs: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::JobList)
            .unwrap_or(Vec::new(&env));

        jobs.push_back(id);
        env.storage().instance().set(&DataKey::JobList, &jobs);
    }

    // Get job
    pub fn get_job(env: Env, id: u64) -> Job {
        env.storage()
            .instance()
            .get(&DataKey::Job(id))
            .unwrap()
    }

    // Close job
    pub fn close_job(env: Env, employer: Address, id: u64) {
        employer.require_auth();

        let mut job: Job = env
            .storage()
            .instance()
            .get(&DataKey::Job(id))
            .unwrap();

        if job.employer != employer {
            panic!("Not authorized");
        }

        job.is_open = false;

        env.storage().instance().set(&DataKey::Job(id), &job);
    }

    // List all jobs
    pub fn list_jobs(env: Env) -> Vec<u64> {
        env.storage()
            .instance()
            .get(&DataKey::JobList)
            .unwrap_or(Vec::new(&env))
    }
}